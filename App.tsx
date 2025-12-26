import React, { useState, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import WatchView from './components/WatchView';
import { ShapeType } from './types';
import { extractColorsFromImage } from './utils/geometry';

// Extended list of images for PsyopQueen.EXE using direct i.imgur.com links
const PSYOP_QUEEN_IMAGES = [
  "https://i.imgur.com/ChM6TPY.png",
  "https://i.imgur.com/e8F96Dq.png",
  "https://i.imgur.com/KNZK7Kt.png",
  "https://i.imgur.com/OlcNYux.png",
  "https://i.imgur.com/MgwArGW.png",
  "https://i.imgur.com/B9F8hbq.png",
  "https://i.imgur.com/nclrLjH.png",
  "https://i.imgur.com/zgQPe5w.png",
  "https://i.imgur.com/LgEs5lN.png",
  "https://i.imgur.com/Ljw62BR.png",
  "https://i.imgur.com/wTqiwQA.png",
  "https://i.imgur.com/cHbhfLp.png",
  "https://i.imgur.com/IFJAHDh.png",
  "https://i.imgur.com/lnF5OZf.png",
  "https://i.imgur.com/K2ml67H.png",
  "https://i.imgur.com/jfNOK4F.png",
  "https://i.imgur.com/UHf0CnK.png",
  "https://i.imgur.com/ciVUVGF.png",
  "https://i.imgur.com/3QoobEA.png",
  "https://i.imgur.com/zx0zc3W.png",
  "https://i.imgur.com/blkRUig.png",
  "https://i.imgur.com/KjYd0ZE.png",
  "https://i.imgur.com/RQ3IxJF.png",
  "https://i.imgur.com/Pvw2u6Y.png",
  "https://i.imgur.com/tOxV8wV.png",
  "https://i.imgur.com/lZtB2UR.png",
  "https://i.imgur.com/gXm5RBH.png",
  "https://i.imgur.com/i0m5cPU.png",
  "https://i.imgur.com/e0pOKpI.png",
  "https://i.imgur.com/O7e2PKr.png",
  "https://i.imgur.com/YKOTTme.png",
  "https://i.imgur.com/1fI2LM5.png",
  "https://i.imgur.com/R50lohH.png",
  "https://i.imgur.com/dpT1TS5.png",
  "https://i.imgur.com/dpT1TS5.png",
  "https://i.imgur.com/FckeYEp.png",
  "https://i.imgur.com/uViFmrg.png",
  "https://i.imgur.com/f7Yuu9Q.png",
  "https://i.imgur.com/LmxG3Sj.png",
  "https://i.imgur.com/soJSv4X.png",
  "https://i.imgur.com/C7j4C5c.png",
  "https://i.imgur.com/ErhvgTS.png",
  "https://i.imgur.com/Yh8cBgf.png",
  "https://i.imgur.com/VSgT3tZ.png",
  "https://i.imgur.com/MlA14k2.png",
  "https://i.imgur.com/E2S3nAN.png",
  "https://i.imgur.com/ku0Emow.png",
  "https://i.imgur.com/Z6hlEEZ.png",
  "https://i.imgur.com/JwdZ4c0.png",
  "https://i.imgur.com/PvCaAmW.png",
  "https://i.imgur.com/jS4a0z9.png",
  "https://i.imgur.com/huPu7st.png",
  "https://i.imgur.com/EGPu2Pq.png",
  "https://i.imgur.com/O41G7oM.png",
  "https://i.imgur.com/X64vjzV.png",
  "https://i.imgur.com/y57rFY6.png",
  "https://i.imgur.com/Cru1QTz.png",
  "https://i.imgur.com/plJk6Ic.png",
  "https://i.imgur.com/Kz8Xz43.png",
  "https://i.imgur.com/7QptNHT.png",
  "https://i.imgur.com/I4XxgwS.png",
  "https://i.imgur.com/TzU90pV.png",
  "https://i.imgur.com/JYxhjuM.png",
  "https://i.imgur.com/sQILMd8.png",
  "https://i.imgur.com/7VyWR4q.png",
  "https://i.imgur.com/EzQeMn6.png",
  "https://i.imgur.com/qkzwKH7.png",
  "https://i.imgur.com/4f26dKb.png",
  "https://i.imgur.com/IepdoDT.png",
  "https://i.imgur.com/JFEszVh.png",
  "https://i.imgur.com/jH0ihHs.png",
  "https://i.imgur.com/FXkkkf6.png",
  "https://i.imgur.com/nVna1zI.png",
  "https://i.imgur.com/6voddfD.png",
  "https://i.imgur.com/hZLRQ7B.png",
  "https://i.imgur.com/B7Kqf15.png",
  "https://i.imgur.com/hzbIvJi.png",
  "https://i.imgur.com/hyvITn9.png",
  "https://i.imgur.com/R9H7bQX.png",
  "https://i.imgur.com/u4Z4weX.png",
  "https://i.imgur.com/tcNOFPu.png",
  "https://i.imgur.com/RR1Je18.png",
  "https://i.imgur.com/zqcBzwK.png",
  "https://i.imgur.com/dwpXQIB.png",
  "https://i.imgur.com/ipNOuWp.png",
  "https://i.imgur.com/4hdy0A3.png",
  "https://i.imgur.com/dkl5Drj.png",
  "https://i.imgur.com/QQEeEPd.png",
  "https://i.imgur.com/2j7bg3W.png",
  "https://i.imgur.com/entmekL.png",
  "https://i.imgur.com/sQVN6NS.png",
  "https://i.imgur.com/MuVbrVy.png",
  "https://i.imgur.com/ELX8qjw.png",
  "https://i.imgur.com/LpWQTTf.png",
  "https://i.imgur.com/mO3mP43.png",
  "https://i.imgur.com/X0J6e0k.png",
  "https://i.imgur.com/SSixOoL.png",
  "https://i.imgur.com/1oruDy3.png",
  "https://i.imgur.com/gw7KIld.png",
  "https://i.imgur.com/OFnmXlZ.png",
  "https://i.imgur.com/mgZ2Xm3.png",
  "https://i.imgur.com/KNZtweN.png",
  "https://i.imgur.com/Rb4rSOy.png",
  "https://i.imgur.com/rDiDSCd.png",
  "https://i.imgur.com/N1CrOrZ.png",
  "https://i.imgur.com/OPm7mjf.png"
];

// --- AUDIO CONFIGURATION ---
// The provided Dropbox link with authentication keys.
const BACKGROUND_MUSIC_URL = "https://www.dropbox.com/scl/fi/azthtqvk8vq6is8nelgkp/BGhack.mp3?rlkey=nnklrxjn4umtix8itbbkq219d&st=sh38kres&dl=0";

const formatAudioUrl = (url: string) => {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("dropbox.com")) {
      urlObj.searchParams.set("raw", "1");
      urlObj.searchParams.delete("dl");
      return urlObj.toString();
    }
    return url;
  } catch (e) {
    console.warn("Error formatting audio URL:", e);
    return url;
  }
};

type ViewState = 'experience' | 'watch';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('experience');
  const [activeShape, setActiveShape] = useState<ShapeType>(ShapeType.PSYOP_QUEEN_EXE);
  
  // 6 Tones for 80s Anime Aesthetic
  const [activeColors, setActiveColors] = useState<string[]>([
    '#2b0033', // Shadow (Deep Purple)
    '#ff0055', // Midtone (Pink)
    '#ffffff', // Highlight (White)
    '#4400ff', // Features (Blue)
    '#00ffcc', // Details/Edges (Cyan - to pop)
    '#120024'  // Background (Darker Purple)
  ]);
  const [expansionFactor, setExpansionFactor] = useState<number>(0.5); // Default 50%
  
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  
  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [wasMutedBeforeWatch, setWasMutedBeforeWatch] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle Audio Auto-Play
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
           setHasInteracted(true);
        }).catch((error) => {
          console.log("Autoplay prevented. Waiting for interaction.");
          setIsMuted(true);
          setHasInteracted(false);
        });
      }
    }
  }, []);

  // Handle Audio Logic when Switching Views
  useEffect(() => {
    if (view === 'watch') {
      setWasMutedBeforeWatch(isMuted);
      setIsMuted(true);
    } else {
      if (!wasMutedBeforeWatch && hasInteracted) {
        setIsMuted(false);
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [view]);

  // Global interaction handler to start audio if it was blocked
  useEffect(() => {
    const handleInteraction = () => {
      if (hasInteracted) return;

      if (audioRef.current) {
         setHasInteracted(true);
         if(isMuted && view !== 'watch') {
           setIsMuted(false);
           audioRef.current.muted = false;
         }
         if (audioRef.current.paused && view !== 'watch') {
           audioRef.current.play().catch(console.error);
         }
      }
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isMuted, hasInteracted, view]);

  const handleToggleMute = () => {
    if (audioRef.current) {
      const newState = !isMuted;
      audioRef.current.muted = newState;
      if (!newState) {
        audioRef.current.play().catch(console.error);
      }
      setIsMuted(newState);
    }
  };

  const handleImageUpload = (url: string) => {
    setCustomLogoUrl(url);
    setActiveShape(ShapeType.LOGO);
  };

  const handleShapeChange = (shape: ShapeType) => {
    if (shape === ShapeType.PSYOP_QUEEN_EXE) {
      const randomIndex = Math.floor(Math.random() * PSYOP_QUEEN_IMAGES.length);
      const randomUrl = PSYOP_QUEEN_IMAGES[randomIndex];
      setCustomLogoUrl(randomUrl);
      setActiveShape(ShapeType.PSYOP_QUEEN_EXE);
    } else {
      setActiveShape(shape);
    }
  };

  const handleAutoColor = async () => {
    const urlToUse = customLogoUrl || "https://i.imgur.com/6TQT9vD.png"; 
    const extractedColors = await extractColorsFromImage(urlToUse);
    if (extractedColors.length === 6) {
        setActiveColors(extractedColors);
    }
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...activeColors];
    newColors[index] = newColor;
    setActiveColors(newColors);
  };

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden selection:bg-red-500 selection:text-white">
      {/* Background Audio */}
      <audio 
        ref={audioRef} 
        src={formatAudioUrl(BACKGROUND_MUSIC_URL)} 
        loop 
        muted={isMuted}
        onError={(e) => console.error("Audio playback error:", e)}
      />

      {/* --- CYBERPUNK FRAME OVERLAY --- */}
      {/* This sits ON TOP of the 3D scene but BEHIND controls */}
      <div className="absolute inset-0 z-10 pointer-events-none transition-all duration-300 ease-out">
        
        {/* Horizontal Scanline Gradient */}
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ 
               background: `linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.1) 50%)`,
               backgroundSize: '100% 4px'
             }}>
        </div>

        {/* Frame Borders - Static, No Glow */}
        <div className="absolute inset-4 border-2 border-white/20 rounded-lg"></div>
        
        {/* Corner Accents - Static Red, No Glow */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-red-600/80"></div>
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-red-600/80"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-red-600/80"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-red-600/80"></div>
             
        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>
      </div>

      {/* 3D Scene Layer */}
      <Scene 
        shape={activeShape} 
        colors={activeColors} 
        expansion={expansionFactor}
        customImageUrl={customLogoUrl}
        rotationSpeed={0.05} // Fixed rotation speed now
      />

      {/* Main Experience Controls */}
      {view === 'experience' && (
        <>
          {/* Start Audio Overlay */}
          {!hasInteracted && isMuted && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
              <div className="bg-white/10 border border-white/20 p-6 rounded-xl animate-pulse text-center">
                <h1 className="text-2xl font-bold tracking-widest text-white mb-2">INITIALIZING SYSTEM</h1>
                <p className="text-sm font-mono text-green-400">[ CLICK ANYWHERE TO START AUDIO ]</p>
              </div>
            </div>
          )}

          <Controls 
            currentShape={activeShape}
            onShapeChange={handleShapeChange}
            currentColors={activeColors}
            onColorChange={handleColorChange}
            handDistance={expansionFactor}
            onImageUpload={handleImageUpload}
            onAutoColor={handleAutoColor}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onNavigateWatch={() => setView('watch')}
          />
        </>
      )}

      {/* Watch View Overlay */}
      {view === 'watch' && (
        <WatchView onBack={() => setView('experience')} />
      )}
    </div>
  );
};

export default App;
