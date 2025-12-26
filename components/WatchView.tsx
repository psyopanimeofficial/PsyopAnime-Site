import React, { useState, useRef } from 'react';

interface WatchViewProps {
  onBack: () => void;
}

type VideoSource = 'STREAM' | 'LOCAL';

// Reverted to original playlist as requested
const PLAYLIST = [
  { id: "FMJCfUhoV0c", title: "INITIAL_INJECTION", duration: "04:12" },
  { id: "BnBj8sRUu6o", title: "NEURAL_HANDSHAKE", duration: "03:45" },
  { id: "iLNypgG-X8k", title: "VOID_GAZE", duration: "02:30" },
  { id: "O3OBtF67MY0", title: "GLITCH_PROTOCOL", duration: "03:15" },
  { id: "69oB50L7euw", title: "REALITY_TEAR", duration: "05:00" },
  { id: "9hlx5Rslrzk", title: "SYSTEM_PURGE", duration: "03:22" }
];

const WatchView: React.FC<WatchViewProps> = ({ onBack }) => {
  const [sourceType, setSourceType] = useState<VideoSource>('STREAM');
  const [currentVideo, setCurrentVideo] = useState(PLAYLIST[0]);
  const [customId, setCustomId] = useState('');
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalUrl(url);
    }
  };

  const handleCustomIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customId.trim()) {
      // Extract ID from URL if full URL is pasted
      let id = customId;
      try {
        if (id.includes('youtube.com') || id.includes('youtu.be')) {
          const url = new URL(id);
          if (url.searchParams.has('v')) {
            id = url.searchParams.get('v') || id;
          } else {
             // Handle short links
             id = url.pathname.slice(1);
          }
        }
      } catch (err) {
        // ignore
      }
      setCurrentVideo({ id: id, title: "CUSTOM_SIGNAL", duration: "UNK" });
      setCustomId('');
    }
  };

  // Standard clean embed URL
  const embedUrl = `https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1&rel=0&controls=1&playsinline=1`;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black/95 text-white overflow-hidden font-mono">
      {/* CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
      
      {/* Header Bar */}
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/50 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all uppercase tracking-widest text-xs"
          >
            <span className="group-hover:-translate-x-1 transition-transform">«</span>
            System_Return
          </button>
          <div className="h-4 w-px bg-white/20"></div>
          <span className="text-xs text-gray-500 tracking-[0.2em]">BROADCAST_MODE // {sourceType}</span>
        </div>
        
        {/* Source Switcher */}
        <div className="flex items-center bg-black border border-white/20 rounded-lg p-1">
            <button 
              onClick={() => setSourceType('STREAM')}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${sourceType === 'STREAM' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Stream
            </button>
            <button 
              onClick={() => setSourceType('LOCAL')}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${sourceType === 'LOCAL' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Direct/Local
            </button>
        </div>

        <div className="hidden md:flex gap-2">
           <div className="w-2 h-2 bg-red-500 animate-pulse rounded-full"></div>
           <span className="text-xs text-red-500 font-bold tracking-widest">LIVE SIGNAL</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 flex flex-col md:flex-row relative z-30">
        
        {/* Video Area (Dominant) */}
        <div className="flex-1 relative bg-black flex items-center justify-center p-4 md:p-12 border-r border-white/5">
          {/* Decorative Corners */}
          <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/30"></div>
          <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-white/30"></div>
          <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-white/30"></div>
          <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/30"></div>

          <div className="relative w-full max-w-5xl aspect-video shadow-[0_0_50px_rgba(255,0,80,0.15)] bg-gray-900 border border-white/10 overflow-hidden flex flex-col justify-center">
            
            {sourceType === 'STREAM' ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={embedUrl}
                title={currentVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              // Local / Direct Video Player
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                {localUrl ? (
                   <video 
                     src={localUrl} 
                     controls 
                     autoPlay 
                     className="w-full h-full object-contain"
                   />
                ) : (
                   <div className="text-center">
                     <p className="text-gray-500 mb-4 font-mono text-sm">NO LOCAL SIGNAL SOURCE</p>
                     <input 
                       type="file" 
                       accept="video/*" 
                       ref={fileInputRef}
                       onChange={handleFileSelect}
                       className="hidden"
                     />
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="px-6 py-3 border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors uppercase tracking-widest text-xs font-bold"
                     >
                       Load Video File (.mp4)
                     </button>
                     <p className="mt-4 text-[10px] text-gray-600 max-w-xs mx-auto">
                       Load a video from your device to experience a fully personalized, branding-free player.
                     </p>
                   </div>
                )}
              </div>
            )}
            
          </div>
        </div>

        {/* Sidebar / Data Panel (Cyberpunk Aesthetic) */}
        <div className="w-full md:w-80 border-l border-white/10 bg-black/80 backdrop-blur-xl p-6 flex flex-col gap-8 overflow-y-auto">
          
          {/* Block 1: Title */}
          <div>
            <h2 className="text-2xl font-bold font-sans tracking-tighter mb-1 text-white">PSYOP_RADIO</h2>
            <div className="w-full h-1 bg-gradient-to-r from-red-500 to-transparent mb-2"></div>
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Interdimensional signals intercepted from the deep web. 
              Decrypted for your viewing pleasure.
            </p>
          </div>

           {/* Manual Input */}
           <div className="bg-white/5 p-3 border border-white/10">
              <form onSubmit={handleCustomIdSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Paste YouTube ID..."
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 px-2 py-1 text-xs text-white focus:border-red-500 outline-none placeholder-gray-600 font-mono"
                />
                <button type="submit" className="text-red-500 hover:text-white px-2">
                   →
                </button>
              </form>
           </div>

          {/* Block 2: Playlist */}
          <div className="flex-1">
            <h3 className="text-[10px] uppercase text-gray-500 tracking-widest mb-4 border-b border-gray-800 pb-2">
              Next_Up.queue
            </h3>
            <div className="flex flex-col gap-3">
              {PLAYLIST.map((video, i) => {
                const isActive = currentVideo.id === video.id;
                return (
                  <div 
                    key={video.id} 
                    onClick={() => {
                      setCurrentVideo(video);
                      setSourceType('STREAM');
                    }}
                    className={`group relative p-3 border transition-all cursor-pointer
                      ${isActive 
                        ? 'border-red-500/50 bg-red-900/10' 
                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                      }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-20 h-14 bg-gray-800 flex-shrink-0 overflow-hidden">
                        <img 
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                         <span className={`text-xs font-bold truncate transition-colors ${isActive ? 'text-red-400' : 'text-gray-300 group-hover:text-white'}`}>
                           {video.title}
                         </span>
                         <span className="text-[10px] text-gray-600 font-mono mt-1">
                           {video.duration} // ARCHIVE_0{i+1}
                         </span>
                      </div>
                    </div>
                    {/* Hover Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-opacity ${isActive ? 'bg-red-500 opacity-100' : 'bg-white opacity-0 group-hover:opacity-100'}`}></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Block 3: Footer Status */}
          <div className="mt-auto pt-6 border-t border-white/10">
             <div className="flex justify-between items-end text-[10px] font-mono text-gray-500">
               <div className="flex flex-col gap-1">
                 <span>LAT: 34.0522 N</span>
                 <span>LON: 118.2437 W</span>
               </div>
               <div className="text-right">
                 <span className="block text-green-500 animate-pulse">● ONLINE</span>
                 <span>SERVER: US-WEST-2</span>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WatchView;