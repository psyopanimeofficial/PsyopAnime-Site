import * as THREE from 'three';
import { ShapeType } from '../types';

export interface GeometryResult {
  positions: Float32Array;
  brightness?: Float32Array; // 0-1 values for color mapping
  edgeStrength?: Float32Array; // 0-1 values indicating if particle is part of an edge
  isBackground?: Float32Array; // 1 if particle is background, 0 if foreground
}

export const generateSphere = (count: number, radius: number): GeometryResult => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return { positions };
};

// --- SEGMENTATION LOGIC ---

const getQuantizedColorKey = (r: number, g: number, b: number) => {
  // Coarser 4-bit quantization (0-15) to group noisy background colors better
  return `${(r >> 4)},${(g >> 4)},${(b >> 4)}`;
};

const analyzeImageSegmentation = (width: number, height: number, pixels: Uint8ClampedArray) => {
  const colorStats: Record<string, { total: number; outer: number; r: number; g: number; b: number }> = {};
  
  // Radial "Outer Zone" detection
  // Expanded: Radius squared > 0.3 means outside ~55% circle radius.
  // This captures more environment.
  const isOuterZone = (x: number, y: number) => {
    const nx = (x / width - 0.5) * 2;
    const ny = (y / height - 0.5) * 2;
    return (nx * nx + ny * ny) > 0.3; 
  };

  // 1. Build Histogram
  for (let y = 0; y < height; y += 4) { 
    for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * 4;
      if (pixels[i + 3] < 50) continue; // Skip transparent

      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const key = getQuantizedColorKey(r, g, b);

      if (!colorStats[key]) {
        colorStats[key] = { total: 0, outer: 0, r, g, b };
      }
      colorStats[key].total++;
      if (isOuterZone(x, y)) {
        colorStats[key].outer++;
      }
    }
  }

  // 2. Classify Colors
  // A color is "Background" if it is predominantly found in the outer zone.
  const bgColors = new Set<string>();
  
  Object.entries(colorStats).forEach(([key, stats]) => {
    // If > 40% of this color's pixels are in the outer zone, it's Background.
    // Lowered threshold to ensure we grab all environmental colors.
    const ratio = stats.outer / stats.total;
    if (ratio > 0.4) { 
      bgColors.add(key);
    }
  });

  return { bgColors, colorStats };
};

// Enhanced Image Processor
export const processImageToPoints = async (imageUrl: string, count: number, scale: number): Promise<GeometryResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(generateSphere(count, scale));
        return;
      }
      
      const width = 600; 
      const height = (img.height / img.width) * width;
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const pixels = imgData.data;
      
      // Perform Segmentation Analysis
      const { bgColors } = analyzeImageSegmentation(width, height, pixels);

      interface Pixel {
        x: number;
        y: number;
        brightness: number;
        edgeStrength: number;
        intensity: number;
        isBg: boolean;
        r: number; g: number; b: number;
      }

      const getBrightness = (x: number, y: number) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return 0;
        const i = (y * width + x) * 4;
        return (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
      };

      let minB = 255;
      let maxB = 0;
      let candidates: Pixel[] = [];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const alpha = pixels[index + 3];
          
          if (alpha > 20) {
            const r = pixels[index];
            const g = pixels[index+1];
            const b = pixels[index+2];
            const bright = (r + g + b) / 3;
            
            if (bright < minB) minB = bright;
            if (bright > maxB) maxB = bright;

            // Sobel Edge
            const gx = getBrightness(x+1, y) - getBrightness(x-1, y);
            const gy = getBrightness(x, y+1) - getBrightness(x, y-1);
            const edgeVal = Math.sqrt(gx*gx + gy*gy);
            const edgeStrength = Math.min(1.0, edgeVal / 100);

            // Classification
            const key = getQuantizedColorKey(r, g, b);
            
            // Background if matches key and isn't a hard edge (focus)
            const matchesBgColor = bgColors.has(key);
            const isBg = matchesBgColor && edgeStrength < 0.5;

            // Candidates selection importance
            let importance = Math.random() * 100;
            if (edgeStrength > 0.2) importance += edgeStrength * 1000;
            if (!isBg) importance += 500; // Boost foreground priority

            candidates.push({
              x, 
              y, 
              brightness: bright, 
              edgeStrength,
              intensity: importance,
              isBg,
              r, g, b
            });
          }
        }
      }

      candidates.sort((a, b) => b.intensity - a.intensity);
      
      let selected = candidates.length > count ? candidates.slice(0, count) : candidates;
      
      // Fill
      if (selected.length < count && candidates.length > 0) {
          const originalLength = selected.length;
          let i = 0;
          while (selected.length < count) {
             const source = selected[i % originalLength];
             selected.push({ ...source, x: source.x + (Math.random()-0.5), y: source.y + (Math.random()-0.5) });
             i++;
          }
      }

      const positions = new Float32Array(count * 3);
      const brightnessArr = new Float32Array(count);
      const edgeStrengthArr = new Float32Array(count);
      const isBackgroundArr = new Float32Array(count);

      const aspectRatio = width / height;
      const bRange = maxB - minB || 1;

      for (let i = 0; i < count; i++) {
        const p = selected[i];
        
        let nx = (p.x / width - 0.5) * 2;
        let ny = -(p.y / height - 0.5) * 2;

        nx *= aspectRatio; 
        const scanlines = 240; 
        ny = Math.floor(ny * scanlines) / scanlines;

        positions[i * 3] = nx * scale * 2.0;
        positions[i * 3 + 1] = ny * scale * 2.0;
        
        // Z-Depth
        let normBright = (p.brightness - minB) / bRange;
        let z = normBright * 0.15 * scale;
        
        // Background Push
        if (p.isBg) {
            z = -0.5 * scale + (normBright * 0.1); 
        } else {
            z += 0.1 * scale; 
        }
        
        positions[i * 3 + 2] = z + (p.edgeStrength * 0.05 * scale);

        brightnessArr[i] = normBright;
        edgeStrengthArr[i] = p.edgeStrength;
        isBackgroundArr[i] = p.isBg ? 1.0 : 0.0;
      }
      
      resolve({ positions, brightness: brightnessArr, edgeStrength: edgeStrengthArr, isBackground: isBackgroundArr });
    };
    
    img.onerror = () => {
        resolve(generateSphere(count, scale));
    };

    img.src = imageUrl;
  });
}

// --- COLOR THEORY UTILS ---

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

const rgbToHex = (c: RGB): string => {
  return "#" + ((1 << 24) + (Math.round(c.r) << 16) + (Math.round(c.g) << 8) + Math.round(c.b)).toString(16).slice(1);
};

const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHsl = (c: RGB): HSL => {
    let r = c.r / 255, g = c.g / 255, b = c.b / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, l };
};

const hslToRgb = (c: HSL): RGB => {
    let r, g, b;
    let h = c.h, s = c.s, l = c.l;
    if (s === 0) { r = g = b = l; } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
};

const colorDistSq = (c1: RGB, c2: RGB) => {
  return (c1.r-c2.r)**2 + (c1.g-c2.g)**2 + (c1.b-c2.b)**2;
};

export const extractColorsFromImage = async (imageUrl: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve([]); return; }
      
      const size = 64; 
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      // 1. SEGMENTATION 
      const { bgColors } = analyzeImageSegmentation(size, size, data);

      // 2. SEPARATE POOLS
      const bgSamples: RGB[] = [];
      const fgSamples: {color:RGB, count:number, hsl:HSL}[] = [];
      
      const bucketMap: Record<string, typeof fgSamples[0]> = {};
      const bucketSize = 10; 

      for(let i=0; i<data.length; i+=4) {
          if(data[i+3]<128) continue;
          const r=data[i], g=data[i+1], b=data[i+2];
          const c = {r, g, b};
          const key = getQuantizedColorKey(r, g, b);

          if (bgColors.has(key)) {
              bgSamples.push(c);
          } else {
              const bucketKey = `${Math.floor(r/bucketSize)},${Math.floor(g/bucketSize)},${Math.floor(b/bucketSize)}`;
              if(!bucketMap[bucketKey]) {
                 bucketMap[bucketKey] = {color:c, count:0, hsl:rgbToHsl(c)};
                 fgSamples.push(bucketMap[bucketKey]);
              }
              bucketMap[bucketKey].count++;
          }
      }

      // --- COLOR SELECTION STRATEGY ---
      // Requirement: Drastically different results each time.
      
      // Step A: Background Color
      // VARIATION: 50% chance to use Average, 50% chance to use a random sample from BG
      let bgHsl = {h:0, s:0, l:0.05};
      const useAverageBg = Math.random() > 0.5;

      if (bgSamples.length > 0) {
         if (useAverageBg) {
             const avg = bgSamples.reduce((a,b)=>({r:a.r+b.r,g:a.g+b.g,b:a.b+b.b}),{r:0,g:0,b:0});
             const bgRgb = {r:avg.r/bgSamples.length, g:avg.g/bgSamples.length, b:avg.b/bgSamples.length};
             bgHsl = rgbToHsl(bgRgb);
         } else {
             const rndBg = bgSamples[Math.floor(Math.random() * bgSamples.length)];
             bgHsl = rgbToHsl(rndBg);
         }
      }
      
      // Step B: Foreground Colors
      fgSamples.sort((a,b) => b.count - a.count);
      
      const distinctFg: typeof fgSamples = [];
      // Pick up to 12 distinct colors to get a good candidate pool
      for (const s of fgSamples) {
          if (distinctFg.length >= 12) break;
          // Distance threshold ~30 (sq 900)
          const isUnique = distinctFg.every(d => colorDistSq(d.color, s.color) > 900);
          if (isUnique) distinctFg.push(s);
      }
      
      if (distinctFg.length === 0 && fgSamples.length > 0) distinctFg.push(fgSamples[0]);
      if (distinctFg.length === 0) distinctFg.push({color: {r:128,g:128,b:128}, count:100, hsl:{h:0,s:0,l:0.5}});

      // --- RANDOMIZATION ---
      // Shuffle the top N distinct colors to change which ones get assigned to what role.
      // This ensures that "Midtone" isn't always the most frequent color.
      const topCandidates = distinctFg.slice(0, Math.min(distinctFg.length, 6));
      
      // Fisher-Yates shuffle
      for (let i = topCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topCandidates[i], topCandidates[j]] = [topCandidates[j], topCandidates[i]];
      }

      // Helpers
      const jitter = (v: number, amt: number) => Math.min(1, Math.max(0, v + (Math.random() * amt * 2 - amt)));
      const jitterHue = (h: number, amt: number) => (h + (Math.random() * amt * 2 - amt) + 1) % 1;

      // 1. MIDTONE (Anchor)
      // Pick from shuffled list
      const midtoneSrc = topCandidates[0] || distinctFg[0];
      const midtone = hslToRgb({
          h: jitterHue(midtoneSrc.hsl.h, 0.05),
          s: jitter(midtoneSrc.hsl.s, 0.1),
          // FORCE midtone luma to middle range to contrast with Shadow and Highlight
          l: Math.max(0.4, Math.min(0.6, jitter(midtoneSrc.hsl.l, 0.1))) 
      });

      // 2. HIGHLIGHT
      // 50% chance: Use actual brightest distinct color. 50% chance: Pick random candidate and force bright.
      let highlightSrc;
      if (Math.random() > 0.5) {
          highlightSrc = distinctFg.reduce((p, c) => c.hsl.l > p.hsl.l ? c : p, distinctFg[0]);
      } else {
          highlightSrc = topCandidates[1] || midtoneSrc;
      }

      const highlight = hslToRgb({
          h: jitterHue(highlightSrc.hsl.h, 0.05),
          s: jitter(highlightSrc.hsl.s, 0.1),
          l: Math.max(0.8, jitter(highlightSrc.hsl.l, 0.1) + 0.1) // Force bright
      });

      // 3. SHADOW: Extreme Contrast
      // Calculate target complementary hue from the chosen midtone
      const midH = midtoneSrc.hsl.h;
      const targetShadowH = (midH + 0.5) % 1; 
      
      // Look for a candidate in shuffled candidates (or all distinct) that matches target
      let shadowSrc = distinctFg.find(c => Math.abs(c.hsl.h - targetShadowH) < 0.25);
      
      // If not found, use a random candidate that isn't midtone
      if (!shadowSrc) {
          shadowSrc = topCandidates[2] || topCandidates[0];
      }
      
      // Force Contrast Logic
      let finalShadowH = shadowSrc.hsl.h;
      const distToComp = Math.abs(shadowSrc.hsl.h - targetShadowH);
      // If the candidate isn't naturally contrasting enough, force shift it
      if (distToComp > 0.25 && distToComp < 0.75) {
          finalShadowH = targetShadowH + (Math.random() * 0.1 - 0.05);
      }
      
      const shadow = hslToRgb({
          h: jitterHue(finalShadowH, 0.08),
          s: Math.max(0.6, jitter(shadowSrc.hsl.s, 0.1)), 
          l: Math.max(0.05, Math.min(0.25, shadowSrc.hsl.l - 0.1)) // Force Darker (<0.25)
      });

      // 4. FEATURES
      // Pick another random candidate
      let featuresSrc = topCandidates[3] || distinctFg[distinctFg.length - 1];
      
      const features = hslToRgb({
          h: jitterHue(featuresSrc.hsl.h, 0.05),
          s: jitter(featuresSrc.hsl.s, 0.1),
          l: jitter(featuresSrc.hsl.l, 0.1)
      });

      // 5. DETAILS/POP
      // Strategy: 50% Complementary Pop, 50% Triadic/Analogous
      const popStrategy = Math.random();
      let detailsH = 0, detailsS = 1, detailsL = 0.7;

      if (popStrategy > 0.5) {
           // Complementary
           detailsH = (midH + 0.5) % 1;
           detailsL = 0.8;
      } else {
          // Triadic
          detailsH = (midH + 0.33) % 1;
          detailsL = 0.6;
      }
      
      const details = hslToRgb({
          h: jitterHue(detailsH, 0.05),
          s: 1.0, 
          l: detailsL
      });
      
      // 6. BACKGROUND
      // Variation: Occasional tint lift
      const bgTint = Math.random() > 0.8 ? 0.15 : 0; 
      const background = hslToRgb({
          h: jitterHue(bgHsl.h, 0.05),
          s: bgHsl.s * (0.5 + Math.random()), 
          l: Math.min(0.25, bgHsl.l * (0.8 + Math.random() * 0.4) + bgTint)
      });

      resolve([
        rgbToHex(shadow),
        rgbToHex(midtone),
        rgbToHex(highlight),
        rgbToHex(features),
        rgbToHex(details),
        rgbToHex(background)
      ]);
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
};