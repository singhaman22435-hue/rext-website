export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  genre: string;
  bitrate: string; // e.g. "YouTube HQ" | "320 kbps"
  year: number;
  bpm?: number;
  bassLevel?: number; // 0-100 recommended bass scale
  isLiked?: boolean;
  isDownloaded?: boolean;
  lyrics?: LyricLine[];
  plays?: number;
  youtubeId?: string;
  source?: 'youtube' | 'audio';
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface EqualizerBand {
  freq: number;
  label: string;
  gain: number; // -12 to +12 dB
}

export interface EqualizerPreset {
  id: string;
  name: string;
  description: string;
  bassBoost: number; // dB (0-18)
  gains: number[]; // 5 band gains [-12 to +12]
  iconName?: string;
}

export interface AudioEngineState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  bassBoost: number;
  trebleBoost: number;
  spatialAudio: boolean;
  equalizerBands: EqualizerBand[];
  activePresetId: string;
  analyserNode: AnalyserNode | null;
  audioContextState: AudioContextState;
  sampleRate: number;
}

export type ViewType = 
  | 'home' 
  | 'all-songs'
  | 'youtube'
  | 'search' 
  | 'library' 
  | 'bass-lab' 
  | 'downloads' 
  | 'favorites' 
  | 'genre';

export type ThemeMode = 'warmer' | 'sunset' | 'cold' | 'mocha';
export type FontStyle = 'outfit' | 'syne' | 'space' | 'cinzel' | 'jakarta';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  color: string;
}

export interface DownloadItem {
  id: string;
  trackId: string;
  track: Track;
  progress: number;
  status: 'downloading' | 'completed' | 'failed';
  downloadedAt: number;
  blobSize?: string;
  blobUrl?: string;
}
