export enum SystemMode {
  FRICTION = 'FRICTION',
  BELT = 'BELT'
}

export interface PulleyState {
  driverDiameter: number; // mm
  drivenDiameter: number; // mm
  inputRpm: number; // rpm
  inputPower: number; // Watts
  centerDistance: number; // mm (Only relevant for BELT mode)
}

export interface CalculatedStats {
  ratio: number;
  inputTorque: number; // N.m
  outputRpm: number;
  outputTorque: number; // N.m
  tangentialVelocity: number; // m/s
  beltLength: number; // mm
  mechanicalAdvantage: number;
}

export interface SimulationConfig {
  mode: SystemMode;
  isPlaying: boolean;
  showVectors: boolean;
}

export interface GraphDataPoint {
  x: number; // Driven Diameter
  y1: number; // Output RPM
  y2: number; // Output Torque
}

export interface RealWorldApplication {
  title: string;
  description: string;
  icon: string;
}