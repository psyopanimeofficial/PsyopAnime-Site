import React, { useRef } from 'react';
import { ShapeType } from '../types';

interface ControlsProps {
  currentShape: ShapeType;
  onShapeChange: (shape: ShapeType) => void;
  currentColors: string[];
  onColorChange: (index: number, color: string) => void;
  handDistance: number;
  onImageUpload: (url: string) => void;
  onAutoColor: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigateWatch: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentShape,
  onShapeChange,
  currentColors,
  onColorChange,
  handDistance,
  onImageUpload,
  onAutoColor,
  isMuted,
  onToggleMute,
  onNavigateWatch
}) => {
  // Only expose PSYOP_QUEEN_EXE
  const shapes = [ShapeType.PSYOP_QUEEN_EXE];
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const colorLabels = [
    "Shadow",
    "Midtone",
    "Highlight",
    "Features",
    "Details", 
    "Background"
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex items-center gap-6">
          <img 
            src="https://i.imgur.com/ChM6TPY.png" 
            alt="PSYOP ANIME" 
            className="h-24 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          />
          
          {/* Main Nav Links */}
          <div className="flex items-center gap-6">
            <button 
              onClick={onNavigateWatch}
              className="text-2xl font-bold tracking-tighter text-white hover:text-red-600 transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] uppercase"
            >
              WATCH
            </button>
            <button 
              className="text-2xl font-bold tracking-tighter text-gray-500 hover:text-gray-400 cursor-not-allowed transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] uppercase"
              title="Coming Soon"
            >
              CREATE
            </button>
            <button 
              className="text-2xl font-bold tracking-tighter text-gray-500 hover:text-gray-400 cursor-not-allowed transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] uppercase"
              title="Coming Soon"
            >
              TUTORIALS
            </button>
          </div>
          
          {/* Mute Toggle */}
          <button 
            onClick={onToggleMute}
            className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-mono uppercase transition-colors"
          >
            {isMuted ? (
              <>
                <span className="text-red-400">MUTED</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              </>
            ) : (
              <>
                <span className="text-green-400">AUDIO ON</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Controls Bottom Bar */}
      <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 w-full max-w-6xl mx-auto mb-4 shadow-2xl">
        <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
          
          {/* Upload & Shape Selectors */}
          <div className="flex-1 w-full overflow-x-auto pb-2 md:pb-0 flex items-center gap-4">
             {/* Hidden File Input */}
             <input
               type="file"
               ref={fileInputRef}
               onChange={handleFileChange}
               accept="image/*"
               className="hidden"
             />
             
             {/* Upload Button */}
             <button
               onClick={() => fileInputRef.current?.click()}
               className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_0_10px_rgba(220,38,38,0.5)] whitespace-nowrap"
             >
               UPLOAD IMG
             </button>
             
             {/* Auto Color Button */}
             <button
               onClick={onAutoColor}
               className="px-4 py-2 rounded-lg text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-[0_0_10px_rgba(147,51,234,0.5)] whitespace-nowrap flex items-center gap-2"
               title="Automatically extract anime tones from the image"
             >
               <span className="text-yellow-300">★</span> AUTO TONE
             </button>

             <div className="w-px h-8 bg-white/10 mx-2"></div>

             <div className="flex gap-2">
               {shapes.map((shape) => (
                 <button
                   key={shape}
                   onClick={() => onShapeChange(shape)}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap
                     ${currentShape === shape 
                       ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105' 
                       : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                     }`}
                 >
                   {shape}
                 </button>
               ))}
             </div>
          </div>

          {/* Color Picker & Separator */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-4 overflow-x-auto w-full xl:w-auto">
             {currentColors.map((col, idx) => (
               <div key={idx} className="flex flex-col gap-1 items-center min-w-[60px]">
                 <label className="text-[9px] uppercase tracking-widest text-gray-400 whitespace-nowrap">{colorLabels[idx] || `Tone ${idx+1}`}</label>
                 <div className="flex items-center justify-center p-1 bg-white/5 rounded-lg border border-white/10">
                   <input 
                      type="color" 
                      value={col}
                      onChange={(e) => onColorChange(idx, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0 appearance-none"
                   />
                 </div>
               </div>
             ))}
          </div>

        </div>
        
        <div className="mt-4 pt-4 border-t border-white/5 text-center md:text-left">
          <p className="text-xs text-gray-500">
             
          </p>
        </div>
      </div>
    </div>
  );
};

export default Controls;
