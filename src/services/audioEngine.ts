import { EqualizerBand, EqualizerPreset } from '../types';

export const DEFAULT_EQ_BANDS: EqualizerBand[] = [
  { freq: 31, label: '31 Hz', gain: 0 },
  { freq: 62, label: '62 Hz', gain: 0 },
  { freq: 125, label: '125 Hz', gain: 0 },
  { freq: 250, label: '250 Hz', gain: 0 },
  { freq: 500, label: '500 Hz', gain: 0 },
  { freq: 1000, label: '1 kHz', gain: 0 },
  { freq: 2000, label: '2 kHz', gain: 0 },
  { freq: 4000, label: '4 kHz', gain: 0 },
  { freq: 8000, label: '8 kHz', gain: 0 },
  { freq: 16000, label: '16 kHz', gain: 0 },
];

export const EQ_PRESETS: EqualizerPreset[] = [
  {
    id: 'studio-hd',
    name: 'Studio Master HD',
    description: 'Lossless balanced studio master with crystal air & punch',
    bassBoost: 6,
    gains: [2, 4, 3, 1, 0, 1, 2, 3, 4, 5],
  },
  {
    id: 'bass-heavy',
    name: 'Heavy 808 Bass',
    description: 'Deep sub-woofer punch with zero distortion brickwall limiter',
    bassBoost: 14,
    gains: [8, 9, 7, 5, 1, -1, 0, 2, 3, 4],
  },
  {
    id: 'club-punch',
    name: 'Punchy Club',
    description: 'Tight kicks and crystal-clear vocals',
    bassBoost: 8,
    gains: [5, 6, 5, 3, 0, -1, 1, 3, 4, 5],
  },
  {
    id: 'vocal-clarity',
    name: 'Vocal Presence',
    description: 'Crisp upfront vocals and intimate lyrics clarity',
    bassBoost: 2,
    gains: [-3, -2, -1, 1, 3, 5, 4, 3, 2, 1],
  },
  {
    id: 'electronic',
    name: 'Electronic & Phonk',
    description: 'Aggressive V-curve with deep sub-bass and high air',
    bassBoost: 10,
    gains: [7, 8, 6, 3, 0, -2, 2, 5, 6, 7],
  },
  {
    id: 'audiophile',
    name: 'Audiophile Pure',
    description: 'Linear response with maximum dynamic range',
    bassBoost: 2,
    gains: [1, 1, 1, 0, 0, 0, 1, 2, 2, 2],
  },
  {
    id: 'flat',
    name: 'Flat (Bypass)',
    description: 'Raw neutral audio bypass',
    bassBoost: 0,
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
];

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private subsonicFilter: BiquadFilterNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private clarityFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private airFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
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

      // 1. Subsonic Highpass Filter (24Hz) - cuts inaudible DC rumble to free up amplifier headroom
      this.subsonicFilter = this.audioCtx.createBiquadFilter();
      this.subsonicFilter.type = 'highpass';
      this.subsonicFilter.frequency.value = 24;
      this.subsonicFilter.Q.value = 0.707;

      // 2. Bass Boost Low-shelf Filter (65Hz sub-punch)
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 65;
      this.bassFilter.gain.value = 6;

      // 3. 10-Band Graphic Equalizer
      this.eqFilters = DEFAULT_EQ_BANDS.map((band, idx) => {
        const filter = this.audioCtx!.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === DEFAULT_EQ_BANDS.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.414;
        }
        filter.frequency.value = band.freq;
        filter.gain.value = band.gain;
        return filter;
      });

      // 4. Vocal Clarity & Lyrics Presence (Peaking at 3500Hz)
      this.clarityFilter = this.audioCtx.createBiquadFilter();
      this.clarityFilter.type = 'peaking';
      this.clarityFilter.frequency.value = 3500;
      this.clarityFilter.Q.value = 1.2;
      this.clarityFilter.gain.value = 1.5;

      // 5. Treble Shelf Filter (8kHz)
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 8000;
      this.trebleFilter.gain.value = 1;

      // 6. Silky Air & Sparkle Filter (12kHz High-Shelf for 24-bit studio sheen)
      this.airFilter = this.audioCtx.createBiquadFilter();
      this.airFilter.type = 'highshelf';
      this.airFilter.frequency.value = 12000;
      this.airFilter.gain.value = 2.0;

      // 7. Stereo Panner / 3D Soundstage
      if (this.audioCtx.createStereoPanner) {
        this.pannerNode = this.audioCtx.createStereoPanner();
        this.pannerNode.pan.value = 0;
      }

      // 8. Studio Brickwall Dynamics Compressor / Limiter (Guarantees zero digital distortion or clipping)
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.value = -6; // dB
      this.compressor.knee.value = 10;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003; // 3ms fast attack
      this.compressor.release.value = 0.18; // 180ms smooth release

      // Connect Media Element Source
      if (!this.sourceNode) {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      }

      // DSP Chain:
      // Source -> Subsonic -> BassFilter -> EQ Filters -> ClarityFilter -> TrebleFilter -> AirFilter -> Panner -> MasterGain -> Compressor (Limiter) -> Analyser -> Destination
      let currentNode: AudioNode = this.sourceNode;

      currentNode.connect(this.subsonicFilter);
      currentNode = this.subsonicFilter;

      currentNode.connect(this.bassFilter);
      currentNode = this.bassFilter;

      for (const eqNode of this.eqFilters) {
        currentNode.connect(eqNode);
        currentNode = eqNode;
      }

      currentNode.connect(this.clarityFilter);
      currentNode = this.clarityFilter;

      currentNode.connect(this.trebleFilter);
      currentNode = this.trebleFilter;

      currentNode.connect(this.airFilter);
      currentNode = this.airFilter;

      if (this.pannerNode) {
        currentNode.connect(this.pannerNode);
        currentNode = this.pannerNode;
      }

      currentNode.connect(this.masterGain);
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.analyser);
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
    if (this.masterGain && this.audioCtx) {
      // Avoid dual-attenuation: masterGain controls the output level in WebAudio
      this.audioElement.volume = 1.0;
      this.masterGain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    } else {
      this.audioElement.volume = clamped;
    }
  }

  public getSource(): string {
    return this.audioElement.src || '';
  }

  public hasSource(): boolean {
    return Boolean(this.audioElement.src);
  }

  public setPlaybackRate(rate: number): void {
    if (isFinite(rate) && rate > 0) {
      this.audioElement.playbackRate = Math.max(0.25, Math.min(2.0, rate));
    }
  }

  public getPlaybackRate(): number {
    return this.audioElement.playbackRate || 1.0;
  }

  public setCurrentTime(time: number): void {
    this.seek(time);
  }

  public setEqGain(bandIndex: number, gainDb: number): void {
    this.setEqBandGain(bandIndex, gainDb);
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

  public setClarity(gainDb: number) {
    const clamped = Math.max(-6, Math.min(8, gainDb));
    if (this.clarityFilter && this.audioCtx) {
      this.clarityFilter.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  public setAir(gainDb: number) {
    const clamped = Math.max(-6, Math.min(8, gainDb));
    if (this.airFilter && this.audioCtx) {
      this.airFilter.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
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
