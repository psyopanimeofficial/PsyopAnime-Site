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
