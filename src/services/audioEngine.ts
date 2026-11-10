import { EqualizerBand, EqualizerPreset } from '../types';

export const DEFAULT_EQ_BANDS: EqualizerBand[] = [
  { freq: 60, label: '60 Hz (Sub)', gain: 0 },
  { freq: 230, label: '230 Hz (Bass)', gain: 0 },
  { freq: 910, label: '910 Hz (Mids)', gain: 0 },
  { freq: 4000, label: '4 kHz (Presence)', gain: 0 },
  { freq: 14000, label: '14 kHz (Treble)', gain: 0 },
];

export const EQ_PRESETS: EqualizerPreset[] = [
  {
    id: 'flat',
    name: 'Flat',
    description: 'Clean balanced natural sound',
    bassBoost: 0,
    gains: [0, 0, 0, 0, 0],
  },
  {
    id: 'bass-heavy',
    name: 'Heavy Bass',
    description: 'Deep punchy low-end response',
    bassBoost: 12,
    gains: [8, 5, -1, 2, 4],
  },
  {
    id: 'club-punch',
    name: 'Punchy Club',
    description: 'Tight kicks and clear vocals',
    bassBoost: 8,
    gains: [6, 4, -2, 3, 5],
  },
  {
    id: 'vocal-clarity',
    name: 'Vocal Boost',
    description: 'Crisp upfront vocal presence',
    bassBoost: 2,
    gains: [-3, -1, 5, 4, 3],
  },
  {
    id: 'electronic',
    name: 'Electronic',
    description: 'Dynamic V-shaped response',
    bassBoost: 8,
    gains: [6, 3, -2, 4, 6],
  },
  {
    id: 'acoustic',
    name: 'Acoustic & Warm',
    description: 'Warm natural mids and gentle highs',
    bassBoost: 4,
    gains: [3, 2, 2, 1, 0],
  }
];

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private trebleFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private isInitialized = false;

  // Callbacks
  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onEnded?: () => void;
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onError?: (error: string) => void;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.setupAudioListeners();
  }

  private setupAudioListeners() {
    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(
          this.audioElement.currentTime,
          this.audioElement.duration || 0
        );
      }
    });

    this.audioElement.addEventListener('durationchange', () => {
      if (this.onTimeUpdate && this.audioElement.duration) {
        this.onTimeUpdate(
          this.audioElement.currentTime,
          this.audioElement.duration
        );
      }
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.onEnded) this.onEnded();
    });

    this.audioElement.addEventListener('play', () => {
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    });

    this.audioElement.addEventListener('pause', () => {
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      if (this.onError) this.onError('Failed to load audio stream');
    });
  }

  /**
   * Initializes the Web Audio DSP Graph
   */
  public async initAudioContext(): Promise<boolean> {
    if (this.isInitialized && this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      return true;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.85;

      // Realtime Analyser for Visualizer
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;

      // Bass Boost Low-shelf Filter (80Hz punch)
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 80;
      this.bassFilter.gain.value = 6;

      // 5-Band Graphic Equalizer
      this.eqFilters = DEFAULT_EQ_BANDS.map((band) => {
        const filter = this.audioCtx!.createBiquadFilter();
        if (band.freq <= 80) {
          filter.type = 'lowshelf';
        } else if (band.freq >= 12000) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = band.freq;
        filter.gain.value = band.gain;
        return filter;
      });

      // Treble Shelf Filter
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 10000;
      this.trebleFilter.gain.value = 1;

      // Stereo Panner
      if (this.audioCtx.createStereoPanner) {
        this.pannerNode = this.audioCtx.createStereoPanner();
        this.pannerNode.pan.value = 0;
      }

      // Connect Media Element Source
      if (!this.sourceNode) {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      }

      // Chain: Source -> BassFilter -> EQ Filters -> TrebleFilter -> Panner -> MasterGain -> Analyser -> Destination
      let currentNode: AudioNode = this.sourceNode;
      currentNode.connect(this.bassFilter);
      currentNode = this.bassFilter;

      for (const eqNode of this.eqFilters) {
        currentNode.connect(eqNode);
        currentNode = eqNode;
      }

      currentNode.connect(this.trebleFilter);
      currentNode = this.trebleFilter;

      if (this.pannerNode) {
        currentNode.connect(this.pannerNode);
        currentNode = this.pannerNode;
      }

      currentNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('AudioContext init note:', err);
      return false;
    }
  }

  /**
   * Load and play actual audio stream
   */
  public async loadAndPlay(audioUrl: string, startTime: number = 0): Promise<boolean> {
    await this.initAudioContext();

    try {
      this.audioElement.src = audioUrl;
      this.audioElement.currentTime = startTime;
      await this.audioElement.play();
      return true;
    } catch (err) {
      console.warn('Playback error (retrying after user gesture):', err);
      return false;
    }
  }

  public play() {
    this.initAudioContext();
    this.audioElement.play().catch((e) => {
      console.warn('Play error:', e);
    });
  }

  public pause() {
    this.audioElement.pause();
  }

  public stop() {
    try {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    } catch {}
  }

  public seek(timeInSeconds: number) {
    if (!isNaN(timeInSeconds) && isFinite(timeInSeconds)) {
      this.audioElement.currentTime = Math.max(0, timeInSeconds);
    }
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = clamped;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public setBassBoost(gainDb: number) {
    const clamped = Math.max(0, Math.min(18, gainDb));
    if (this.bassFilter && this.audioCtx) {
      this.bassFilter.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  public setTrebleBoost(gainDb: number) {
    const clamped = Math.max(-10, Math.min(10, gainDb));
    if (this.trebleFilter && this.audioCtx) {
      this.trebleFilter.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  public setSpatialAudio(enabled: boolean) {
    if (this.pannerNode && this.audioCtx) {
      this.pannerNode.pan.setTargetAtTime(enabled ? 0.2 : 0, this.audioCtx.currentTime, 0.1);
    }
  }

  public setEqBandGain(bandIndex: number, gainDb: number) {
    if (this.eqFilters[bandIndex] && this.audioCtx) {
      const clamped = Math.max(-12, Math.min(12, gainDb));
      this.eqFilters[bandIndex].gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  public applyPreset(preset: EqualizerPreset) {
    this.setBassBoost(preset.bassBoost);
    preset.gains.forEach((gain, i) => {
      this.setEqBandGain(i, gain);
    });
  }

  public getByteFrequencyData(target?: Uint8Array): Uint8Array {
    if (!this.analyser) {
      if (target) {
        target.fill(0);
        return target;
      }
      return new Uint8Array(64).fill(0);
    }
    const data = target || new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data as any);
    return data;
  }

  public getByteTimeDomainData(target?: Uint8Array): Uint8Array {
    if (!this.analyser) {
      if (target) {
        target.fill(128);
        return target;
      }
      return new Uint8Array(64).fill(128);
    }
    const data = target || new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data as any);
    return data;
  }

  public getCurrentTime(): number {
    return this.audioElement.currentTime || 0;
  }

  public getDuration(): number {
    return this.audioElement.duration || 0;
  }
}

export const audioEngine = new AudioEngine();
export default audioEngine;
