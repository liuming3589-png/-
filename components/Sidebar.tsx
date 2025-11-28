import React, { useRef, useState } from 'react';
import { Box, Plus, MessageSquare, Monitor, Smartphone, Layout, X, RotateCcw, Clock, Key, Eye, EyeOff } from 'lucide-react';
import { DirectorSettings, HistoryItem } from '../types';

interface SidebarProps {
  settings: DirectorSettings;
  setSettings: React.Dispatch<React.SetStateAction<DirectorSettings>>;
  onGenerate: () => void;
  isGenerating: boolean;
  history: HistoryItem[];
  onRestoreHistory: (item: HistoryItem) => void;
  // Props for lifted state
  mainImage: string | null;
  setMainImage: (img: string | null) => void;
  auxImages: string[];
  setAuxImages: React.Dispatch<React.SetStateAction<string[]>>;
  // Props for API Key
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    settings, 
    setSettings, 
    onGenerate, 
    isGenerating, 
    history, 
    onRestoreHistory,
    mainImage,
    setMainImage,
    auxImages,
    setAuxImages,
    apiKey,
    setApiKey
}) => {
  const auxFileInputRef = useRef<HTMLInputElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const [showKey, setShowKey] = useState(false);
  
  const updateSetting = <K extends keyof DirectorSettings>(key: K, value: DirectorSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAuxFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAuxImages(prev => [...prev, event.target!.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    }
    if (auxFileInputRef.current) auxFileInputRef.current.value = '';
  };

  const handleMainFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMainImage(event.target!.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    if (mainFileInputRef.current) mainFileInputRef.current.value = '';
  };

  const removeAuxImage = (index: number) => {
    setAuxImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full md:w-[380px] h-auto md:h-full flex-shrink-0 flex flex-col border-r border-neutral-800 bg-cine-panel text-neutral-400 font-mono text-xs select-none overflow-y-auto max-h-[40vh] md:max-h-full scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
      
      {/* SECTION 00: API Key */}
      <div className="p-6 border-b border-neutral-800 border-dashed flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <Key size={12} className="text-cine-yellow" />
           <span className="text-neutral-500 font-bold tracking-wider">00. API CONFIG</span>
        </div>
        <div className="relative">
            <input 
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste Gemini API Key (Optional)..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 pr-8 text-xs text-neutral-300 focus:border-cine-yellow focus:outline-none transition-colors font-mono placeholder-neutral-700"
            />
            <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2.5 text-neutral-600 hover:text-neutral-400"
            >
                {showKey ? <EyeOff size={12}/> : <Eye size={12} />}
            </button>
        </div>
        <p className="text-[10px] text-neutral-600 leading-tight">
            Leave empty to use shared/environment key. Your key is saved locally.
        </p>
      </div>

      {/* SECTION 01: Reference Images */}
      <div className="p-6 border-b border-neutral-800 border-dashed flex flex-col gap-4">
        <div className="flex justify-between items-center">
           <span className="text-neutral-500 font-bold tracking-wider">01. 参考素材 (REFERENCES)</span>
        </div>
        
        {/* Large Main Reference Area */}
        {mainImage ? (
           <div className="w-full aspect-video bg-neutral-800 rounded border border-neutral-700 hover:border-cine-yellow transition-colors relative group overflow-hidden">
               <img src={mainImage} className="w-full h-full object-cover" alt="Main Ref" />
               <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-cine-yellow border border-neutral-800 pointer-events-none">
                 主视觉 (KEY VISUAL)
               </div>
               <button 
                  onClick={() => setMainImage(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/80"
               >
                  <X size={12} />
               </button>
           </div>
        ) : (
           <div 
              onClick={() => mainFileInputRef.current?.click()}
              className="w-full aspect-video bg-neutral-900/30 rounded border border-neutral-700 border-dashed hover:border-cine-yellow transition-colors cursor-pointer flex flex-col items-center justify-center group"
           >
              <div className="bg-neutral-800 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                  <Plus size={20} className="text-neutral-400 group-hover:text-cine-yellow" />
              </div>
              <span className="text-[10px] text-neutral-600 group-hover:text-cine-yellow uppercase tracking-widest">
                  上传主视觉 (Upload Key Visual)
              </span>
           </div>
        )}

        <input 
            type="file" 
            ref={mainFileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleMainFileUpload}
        />

        {/* Auxiliary Views */}
        <div>
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-neutral-600 uppercase tracking-widest">辅助视图 (AUX)</span>
              <span className="text-[10px] text-neutral-700">{auxImages.length}/3</span>
           </div>
           
           <div className="grid grid-cols-3 gap-2">
              {auxImages.map((img, idx) => (
                <div key={idx} className="aspect-square bg-neutral-800 rounded border border-neutral-700 relative group overflow-hidden">
                   <img src={img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={`Aux ${idx}`} />
                   <button 
                      onClick={() => removeAuxImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/80"
                   >
                      <X size={10} />
                   </button>
                </div>
              ))}

              {auxImages.length < 3 && (
                <button 
                   onClick={() => auxFileInputRef.current?.click()}
                   className="aspect-square bg-neutral-900/50 rounded border border-neutral-700 border-dashed hover:border-cine-yellow transition-colors flex flex-col items-center justify-center cursor-pointer text-neutral-600 hover:text-cine-yellow group"
                >
                   <Plus size={16} className="group-hover:scale-110 transition-transform"/>
                </button>
              )}
           </div>
           <input 
              type="file" 
              ref={auxFileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAuxFileUpload}
           />
        </div>
      </div>

      {/* SECTION 02: Director Deck */}
      <div className="p-6 flex flex-col gap-8">
        <h2 className="text-sm font-bold text-neutral-200 tracking-wider">02. 导演控制台 (DIRECTOR DECK)</h2>

        {/* Core Mode */}
        <div className="space-y-3">
          <span className="uppercase text-[10px] tracking-widest text-neutral-500">核心模式 (CORE MODE)</span>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => updateSetting('mode', 'spatial')}
              className={`flex items-center justify-center gap-2 py-3 px-2 border rounded transition-all duration-200 ${
                settings.mode === 'spatial' 
                ? 'border-cine-yellow text-cine-yellow bg-cine-yellow/5' 
                : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/30'
              }`}
            >
              <Box size={14} />
              <span>空间探索</span>
            </button>
            <button 
              onClick={() => updateSetting('mode', 'narrative')}
              className={`flex items-center justify-center gap-2 py-3 px-2 border rounded transition-all duration-200 ${
                settings.mode === 'narrative' 
                ? 'border-cine-yellow text-cine-yellow bg-cine-yellow/5' 
                : 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/30'
              }`}
            >
              <MessageSquare size={14} />
              <span>对话叙事</span>
            </button>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-3">
          <span className="uppercase text-[10px] tracking-widest text-neutral-500">画幅选择 (ASPECT RATIO)</span>
          <div className="grid grid-cols-3 gap-2">
            {['16:9', '9:16', '1:1', '4:3', '3:4'].map((ratio) => (
                <button 
                key={ratio}
                onClick={() => updateSetting('aspectRatio', ratio as any)} 
                className={`flex flex-col items-center justify-center py-3 border rounded transition-all ${
                    settings.aspectRatio === ratio ? 'bg-neutral-800 border-cine-yellow text-cine-yellow' : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/50'
                }`}
                >
                {ratio === '16:9' ? <Monitor size={16} className="mb-1" /> :
                 ratio === '9:16' ? <Smartphone size={16} className="mb-1" /> :
                 ratio === '1:1' ? <Box size={16} className="mb-1" /> :
                 <Layout size={14} className={`mb-1 ${ratio === '3:4' ? 'rotate-90' : ''}`} />}
                <span className="scale-90">{ratio}</span>
                </button>
            ))}
             <div className="border border-transparent"></div>
          </div>
        </div>

        {/* Resolution */}
        <div className="space-y-3">
          <span className="uppercase text-[10px] tracking-widest text-neutral-500">输出精度 (RESOLUTION)</span>
          <div className="grid grid-cols-2 gap-0 border border-neutral-700 rounded overflow-hidden">
            <button 
               onClick={() => updateSetting('resolution', '2K')}
               className={`py-3 text-center border-r border-neutral-700 transition-colors ${
                 settings.resolution === '2K' ? 'bg-cine-yellow text-cine-black font-bold' : 'hover:bg-neutral-800'
               }`}
            >
              2K
            </button>
            <button 
               onClick={() => updateSetting('resolution', '4K')}
               className={`py-3 text-center transition-colors ${
                 settings.resolution === '4K' ? 'bg-cine-yellow text-cine-black font-bold' : 'hover:bg-neutral-800'
               }`}
            >
              4K
            </button>
          </div>
        </div>

        <div>
            <button
                disabled={isGenerating || !settings.prompt}
                onClick={onGenerate}
                className={`w-full py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
                    isGenerating 
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-200 text-black hover:bg-cine-yellow'
                }`}
            >
                {isGenerating ? 'Rendering...' : 'Generate Scene'}
            </button>
        </div>

      </div>

      {/* SECTION 03: History */}
      <div className="p-6 pt-0 flex flex-col gap-4 pb-12">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
                <Clock size={12} className="text-neutral-500"/>
                <span className="text-neutral-500 font-bold tracking-wider">03. 历史记录 (HISTORY)</span>
            </div>
            <span className="text-[10px] text-neutral-700">{history.length} ITEMS</span>
        </div>
        <div className="flex flex-col gap-2">
            {history.map(item => (
                <div 
                    key={item.id} 
                    className="group flex flex-col bg-neutral-900/50 border border-neutral-800 p-3 rounded hover:border-cine-yellow/50 transition-colors cursor-pointer relative" 
                    onClick={() => onRestoreHistory(item)}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-neutral-600 font-mono">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-cine-yellow">
                            <span className="text-[9px] uppercase tracking-wider">Load</span>
                            <RotateCcw size={10} />
                        </div>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 mb-2 font-sans leading-relaxed">{item.settings.prompt}</p>
                    <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-700">{item.settings.aspectRatio}</span>
                        <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-700 uppercase">{item.settings.mode}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;