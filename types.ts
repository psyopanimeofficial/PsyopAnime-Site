export enum ShapeType {
  SPHERE = 'Sphere', // Kept as fallback/initialization shape
  PSYOP_QUEEN_EXE = 'PsyopQueen.EXE',
  LOGO = 'Logo' // Represents custom upload or default logo
}

export interface ParticleConfig {
  count: number;
  color: string;
  size: number;
  shape: ShapeType;
}

export interface HandData {
  leftHand?: { x: number; y: number; z: number; isOpen: boolean };
  rightHand?: { x: number; y: number; z: number; isOpen: boolean };
  distance: number; // Normalized 0-1 distance between hands
  isTracking: boolean;
}