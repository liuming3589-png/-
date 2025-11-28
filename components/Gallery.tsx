import React from 'react';
import { GeneratedImage } from '../types';
import { Maximize2, Loader2, Download } from 'lucide-react';

interface GalleryProps {
  images: GeneratedImage[];
  isGenerating: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ images, isGenerating }) => {
  
  const handleDownload = (url: string, id: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinegen_render_${id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 bg-black flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="h-14 border-b border-neutral-900 flex items-center justify-between px-8 bg-black/50 backdrop-blur-sm z-10 font-mono text-xs">
        <span className="text-neutral-400">04. 沉浸灯箱 (IMMERSIVE LIGHTBOX)</span>
        <div className="flex items-center gap-4 text-neutral-500">
           {isGenerating && <span className="flex items-center text-cine-yellow animate-pulse"><Loader2 className="animate-spin mr-2 h-3 w-3" /> RENDERING...</span>}
           <span>{images.length} / 10 已渲染 (RENDERED)</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-video bg-neutral-900 rounded-sm overflow-hidden border border-neutral-900 hover:border-neutral-600 transition-all duration-300">
              <img 
                src={img.url} 
                alt={img.prompt} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
              />
              
              {/* Overlay Info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                 <p className="text-white text-xs font-mono truncate w-full mb-1">{img.prompt}</p>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-cine-yellow bg-cine-yellow/10 px-1 py-0.5 rounded">{img.resolution}</span>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleDownload(img.url, img.id)}
                            className="text-neutral-400 hover:text-cine-yellow transition-colors"
                            title="Download"
                        >
                            <Download size={14} />
                        </button>
                        <button className="text-neutral-400 hover:text-white transition-colors">
                            <Maximize2 size={14} />
                        </button>
                    </div>
                 </div>
              </div>
            </div>
          ))}

          {/* Placeholders to fill the grid if empty or sparse, matching the aesthetic */}
          {images.length === 0 && !isGenerating && (
             <div className="col-span-full h-96 flex flex-col items-center justify-center text-neutral-600 font-mono text-sm border border-neutral-900 border-dashed rounded">
                <p>Waiting for director input...</p>
                <p className="text-xs mt-2 opacity-50">Set parameters and click GENERATE</p>
             </div>
          )}
        </div>
      </div>
      
      {/* Floating Action Button (bottom right from screenshot) */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
         <button className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-neutral-400 transition-colors border border-neutral-700">
             <Maximize2 size={16} />
         </button>
         <button className="w-12 h-12 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-full flex items-center justify-center transition-colors border border-rose-800 backdrop-blur font-bold shadow-lg shadow-rose-900/20">
             <span className="text-xs">中A</span>
         </button>
      </div>

    </div>
  );
};

export default Gallery;