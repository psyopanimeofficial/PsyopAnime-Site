import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Particles from './Particles';
import { ShapeType } from '../types';

// Fix for JSX.IntrinsicElements errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}

interface SceneProps {
  shape: ShapeType;
  colors: string[];
  expansion: number;
  customImageUrl?: string | null;
}

const Scene: React.FC<SceneProps> = ({ shape, colors, expansion, customImageUrl }) => {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Particles 
          shape={shape} 
          colors={colors} 
          expansion={expansion} 
          count={35000} // Increased for high-fidelity anime aesthetic
          customImageUrl={customImageUrl} 
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={2} 
          maxDistance={20}
          autoRotate={false}
        />
        
        {/* Post-processing effects could go here (Bloom, etc) for extra flair */}
      </Canvas>
    </div>
  );
};

export default Scene;