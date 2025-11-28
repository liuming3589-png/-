export type AspectRatio = '16:9' | '9:16' | '1:1' | '3:4' | '4:3'; // Gemini supported ratios.
export type ImageResolution = '1K' | '2K' | '4K';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  ratio: AspectRatio;
  resolution: ImageResolution;
}

export interface DirectorSettings {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  mode: 'spatial' | 'narrative';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  settings: DirectorSettings;
}