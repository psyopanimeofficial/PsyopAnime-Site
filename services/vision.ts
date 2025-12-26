// Camera services have been completely disabled/removed.

export const initializeHandDetection = async () => {
  console.log("Vision system disabled.");
  return { handLandmarker: null };
};

export const detectHands = (video: HTMLVideoElement, lastVideoTime: number) => {
  return null;
};
