import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | undefined;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

export const initializeHandDetection = async () => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
    );
    
    // Initialize Hand Tracker
    // CRITICAL FIX: Use "CPU" delegate. "GPU" often fails to initialize in 
    // web containers or specific browser/driver combos, causing the "No Signal" loop.
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "CPU", 
      },
      runningMode: runningMode,
      numHands: 2,
    });

    console.log("Hand detection initialized successfully");
    return { handLandmarker };
  } catch (error) {
    console.error("Failed to initialize hand detection:", error);
    throw error;
  }
};

export const detectHands = (video: HTMLVideoElement, lastVideoTime: number) => {
  if (!handLandmarker) return null;

  try {
    let startTimeMs = performance.now();
    
    // Ensure video has dimensions and data before detecting
    if (video.videoWidth > 0 && video.currentTime !== lastVideoTime) {
      const results = handLandmarker.detectForVideo(video, startTimeMs);
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks1 = results.landmarks[0];
        const landmarks2 = results.landmarks.length > 1 ? results.landmarks[1] : null;

        const p1 = landmarks1[0]; 
        
        let distance = 0.5; 

        if (landmarks2) {
          const p2 = landmarks2[0];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          distance = Math.sqrt(dx*dx + dy*dy);
          // Normalize (approximate arm span distance)
          distance = Math.max(0, Math.min(1, (distance - 0.1) / 0.7));
        } else {
          // If only one hand, default to 0.5
          distance = 0.5;
        }

        return {
          isTracking: true,
          distance: distance,
          handsDetected: results.landmarks.length
        };
      }
      
      // Explicitly return tracking false if no landmarks found
      return { isTracking: false, distance: 0.5, handsDetected: 0 };
    }
  } catch (e) {
    console.warn("Detection error:", e);
  }
  return null;
};