export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface OscillatorConfig {
  id: string;
  freq: number;
  type: Waveform;
  vol: number; // 0.0 to 1.0
  active: boolean;
}

export interface InstrumentHarmonic {
  harmonic: number; // 1 to 10
  percentage: number; // 0 to 100
}

export interface InstrumentPreset {
  name: string;
  harmonics: number[]; // Array of 10 percentages corresponding to harmonics 1-10
}

export interface NoteMap {
  [key: string]: number;
}

export type Language = 'en' | 'zh';
export type SortOrder = 'none' | 'asc' | 'desc';
