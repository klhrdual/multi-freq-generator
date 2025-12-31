import { OscillatorConfig } from '../types';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private oscillators: Map<string, { osc: OscillatorNode; gain: GainNode }> = new Map();

  public init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.analyser = this.audioCtx.createAnalyser();
      
      this.analyser.fftSize = 2048;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      
      this.masterGain.gain.value = 0.5; // Default master volume
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.audioCtx) {
       this.masterGain.gain.setTargetAtTime(val, this.audioCtx.currentTime, 0.1);
    }
  }

  public startOscillator(config: OscillatorConfig) {
    if (!this.audioCtx || !this.masterGain) this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Stop existing if any (update case)
    this.stopOscillator(config.id);

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = config.type;
    osc.frequency.value = config.freq;
    gain.gain.value = 0; // Start at 0 for fade in

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start();
    
    // Smooth entry
    gain.gain.setTargetAtTime(config.vol, this.audioCtx.currentTime, 0.05);

    this.oscillators.set(config.id, { osc, gain });
  }

  public updateOscillator(config: OscillatorConfig) {
    const node = this.oscillators.get(config.id);
    if (node && this.audioCtx) {
      // Smooth transitions
      node.osc.frequency.setTargetAtTime(config.freq, this.audioCtx.currentTime, 0.05);
      node.gain.gain.setTargetAtTime(config.vol, this.audioCtx.currentTime, 0.05);
      if (node.osc.type !== config.type) {
        node.osc.type = config.type;
      }
    } else {
      // If active but not running, start it
      if (config.active) {
          this.startOscillator(config);
      }
    }
  }

  public stopOscillator(id: string) {
    const node = this.oscillators.get(id);
    if (node && this.audioCtx) {
      try {
        // Fade out
        node.gain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
        setTimeout(() => {
          node.osc.stop();
          node.osc.disconnect();
          node.gain.disconnect();
        }, 100);
      } catch (e) {
        console.warn('Error stopping oscillator', e);
      }
      this.oscillators.delete(id);
    }
  }

  public stopAll() {
    this.oscillators.forEach((_, id) => this.stopOscillator(id));
  }
}

export const audioService = new AudioService();
