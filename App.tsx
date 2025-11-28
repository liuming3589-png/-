import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import { DirectorSettings, GeneratedImage, HistoryItem } from './types';
import { generateCinematicImage } from './services/geminiService';

// Placeholder data to make the app look populated initially, similar to the screenshot
const PLACEHOLDER_IMAGES: GeneratedImage[] = [
    { id: '1', url: 'https://picsum.photos/seed/autumn1/800/450', prompt: 'Autumn leaves cycling path, sunny day', ratio: '16:9', resolution: '2K' },
    { id: '2', url: 'https://picsum.photos/seed/boybike/800/450', prompt: 'Young boy on a bicycle, close up shot, 3d animation style', ratio: '16:9', resolution: '2K' },
    { id: '3', url: 'https://picsum.photos/seed/river/800/450', prompt: 'River side view with autumn trees', ratio: '16:9', resolution: '2K' },
    { id: '4', url: 'https://picsum.photos/seed/bench/800/450', prompt: 'Empty park bench overlooking the river', ratio: '16:9', resolution: '2K' },
    { id: '5', url: 'https://picsum.photos/seed/leaves/800/450', prompt: 'Falling orange leaves detail', ratio: '16:9', resolution: '2K' },
    { id: '6', url: 'https://picsum.photos/seed/helmet/800/450', prompt: 'Character putting on a green helmet', ratio: '16:9', resolution: '2K' },
];

const App: React.FC = () => {
  const [settings, setSettings] = useState<DirectorSettings>({
    prompt: 'A cinematic shot of a young boy riding a bicycle on a park path covered in golden autumn leaves, 3D animation style, warm lighting, river in background.',
    aspectRatio: '16:9',
    resolution: '2K',
    mode: 'spatial'
  });

  // Main reference image state (lifted from Sidebar)
  const [mainImage, setMainImage] = useState<string | null>(null);
  // Auxiliary reference images state (lifted from Sidebar)
  const [auxImages, setAuxImages] = useState<string[]>([]);
  
  // API Key state
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  const [images, setImages] = useState<GeneratedImage[]>(PLACEHOLDER_IMAGES);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Persist API Key
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }, [apiKey]);

  const handleGenerate = async () => {
    if (!settings.prompt) return;
    setIsGenerating(true);
    try {
      const generatedUrls = await generateCinematicImage(
          settings.prompt, 
          settings.aspectRatio, 
          settings.resolution,
          { main: mainImage, aux: auxImages },
          settings.mode,
          apiKey // Pass the user API key
      );
      
      const newImages: GeneratedImage[] = generatedUrls.map((url) => ({
        id: Date.now().toString() + Math.random().toString(),
        url,
        prompt: settings.prompt,
        ratio: settings.aspectRatio,
        resolution: settings.resolution
      }));

      setImages(prev => [...newImages, ...prev]);

      // Save to history
      setHistory(prev => [{
        id: Date.now().toString(),
        timestamp: Date.now(),
        settings: { ...settings }
      }, ...prev]);

    } catch (error: any) {
      console.error("Failed to generate", error);
      let msg = "Generation failed. Please try again.";
      if (error.message.includes("API Key")) {
          msg = error.message;
      } else if (error.message.includes("Entity not found") || error.message.includes("404")) {
          msg = "Model not found or API Key invalid. Please check your settings.";
      }
      alert(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setSettings(item.settings);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-black overflow-hidden text-neutral-200 font-sans">
       <Sidebar 
         settings={settings}
         setSettings={setSettings}
         onGenerate={handleGenerate}
         isGenerating={isGenerating}
         history={history}
         onRestoreHistory={handleRestoreHistory}
         mainImage={mainImage}
         setMainImage={setMainImage}
         auxImages={auxImages}
         setAuxImages={setAuxImages}
         apiKey={apiKey}
         setApiKey={setApiKey}
       />
       <Gallery 
         images={images}
         isGenerating={isGenerating}
       />
    </div>
  );
};

export default App;