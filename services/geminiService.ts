import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageResolution } from "../types";

// Helper to ensure API Key selection
const ensureApiKey = async (): Promise<void> => {
  // If we have an environment variable API key, we don't need the prompt
  if (process.env.API_KEY) return;

  // Fallback to Google AI Studio prompt if available (dev environment)
  if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
      return;
  }

  // If neither is available, throw specific error
  throw new Error("Missing API Key. Please enter your API Key in the settings or configure your environment.");
};

export const generateCinematicImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  resolution: ImageResolution,
  refImages: { main: string | null; aux: string[] } = { main: null, aux: [] },
  mode: 'spatial' | 'narrative' = 'spatial',
  userApiKey?: string
): Promise<string[]> => {
  try {
    let ai: GoogleGenAI;

    if (userApiKey) {
        // Use user provided key
        ai = new GoogleGenAI({ apiKey: userApiKey });
    } else {
        // Fallback to system key checks
        await ensureApiKey();
        const systemKey = process.env.API_KEY;
        if (!systemKey) throw new Error("API Key configuration failed.");
        ai = new GoogleGenAI({ apiKey: systemKey });
    }
    
    // Construct Prompt with references
    let finalPrompt = prompt;
    let parts: any[] = [];

    // Add Main Reference if exists
    if (refImages.main) {
        // Simple base64 strip if needed, but SDK handles base64 string usually if formatted correctly
        const base64Data = refImages.main.split(',')[1];
        parts.push({
            inlineData: {
                mimeType: "image/png",
                data: base64Data
            }
        });
        finalPrompt = `[Main Character/Style Reference] ${finalPrompt}`;
    }

    // Add Aux Images
    refImages.aux.forEach((img, idx) => {
        const base64Data = img.split(',')[1];
        parts.push({
            inlineData: {
                mimeType: "image/png",
                data: base64Data
            }
        });
    });

    if (refImages.aux.length > 0) {
        finalPrompt = `${finalPrompt} [Ensure consistency with provided reference views]`;
    }

    // Define 10 variations based on mode
    const variations = [];
    if (mode === 'spatial') {
        variations.push(
            "Wide shot, establishing the environment",
            "Low angle shot looking up, emphasizing scale",
            "High angle overhead shot, mapping the space",
            "Dutch angle, dynamic tension",
            "Tracking shot perspective, movement into depth",
            "Extreme long shot, isolation in space",
            "Detail shot of the environment texture",
            "Over-the-shoulder looking at the horizon",
            "Silhouette shot against light source",
            "Symmetrical composition, balanced space"
        );
    } else {
         variations.push(
            "Close up, speaking expression",
            "Medium shot, listening reaction",
            "Two-shot (if applicable) or interaction with off-screen character",
            "Over-the-shoulder, conversational perspective",
            "Eye-level, intimate connection",
            "Side profile, contemplative",
            "Reaction shot, subtle emotion",
            "Gesture focus, hand movement during speech",
            "Focus pull between character and background",
            "Low key lighting, dramatic monologue atmosphere"
        );
    }

    // We will generate fewer images in parallel to avoid hitting rate limits too hard, 
    // or batch them if the API allows. For this demo, let's try to generate 2 distinct calls 
    // requesting multiple images if possible, or just loop. 
    // Gemini 3 Pro Image generation usually returns 1-4 images per call. 
    // We will make 3 calls to get ~10 images (assuming 4 per call is possible, or we loop).
    
    // NOTE: Current SDK/Model `generateContent` for images typically returns 1 image per prompt unless configured.
    // To get 10 variations, we ideally make 10 calls. To be safe with quotas in a shared app, let's limit to 4 for now, 
    // or just 1 call with a prompt asking for a "sheet" if supported, but separate calls are better for distinct angles.
    
    // For the sake of the "Director Deck" experience, let's fire 4 distinct calls with different variations from the list.
    // Generating 10 4K images might be too slow/expensive for a shared demo. Let's do 4 high quality ones.
    
    const selectedVariations = variations.slice(0, 4);
    const promises = selectedVariations.map(variation => {
        const variationPrompt = `${finalPrompt}. Specific Shot: ${variation}.`;
        return ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [...parts, { text: variationPrompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: resolution
                }
            }
        });
    });

    const responses = await Promise.all(promises);

    const images: string[] = [];
    responses.forEach(response => {
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    images.push(`data:image/png;base64,${part.inlineData.data}`);
                }
            }
        }
    });

    return images;

  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    // If no user API key and we get a permission/found error, try to prompt locally
    if (!userApiKey && error.message && error.message.includes("Requested entity was not found")) {
         if (window.aistudio) {
             await window.aistudio.openSelectKey();
             // Retry
             return generateCinematicImage(prompt, aspectRatio, resolution, refImages, mode);
         }
    }
    throw error;
  }
};