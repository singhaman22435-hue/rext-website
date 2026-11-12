import { useSyncExternalStore } from 'react';
import { Track } from '../types';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  bassBoost: number;
  trebleBoost: number;
  spatialAudio: boolean;
  playbackSpeed: number;
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;
  playQueue: Track[];
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  isMuted: false,
  bassBoost: 6,
  trebleBoost: 0,
  spatialAudio: false,
  playbackSpeed: 1.0,
  repeatMode: 'off',
  isShuffle: false,
  playQueue: [],
};

type Listener = () => void;

class PlayerStore {
  private state: PlayerState = { ...initialState };
  private listeners: Set<Listener> = new Set();

  public getState(): PlayerState {
    return this.state;
  }

  public setState(partial: Partial<PlayerState> | ((prev: PlayerState) => Partial<PlayerState>)): void {
    const next = typeof partial === 'function' ? partial(this.state) : partial;
    this.state = { ...this.state, ...next };
    this.notify();
  }

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // Fast direct update for high-frequency time updates
  public setTime(currentTime: number, duration?: number): void {
    const dur = duration !== undefined && duration > 0 ? duration : this.state.duration;
    if (Math.abs(this.state.currentTime - currentTime) > 0.05 || this.state.duration !== dur) {
      this.state = {
        ...this.state,
        currentTime,
        duration: dur,
      };
      this.notify();
    }
  }

  public reset(): void {
    this.state = { ...initialState };
    this.notify();
  }
}

export const playerStore = new PlayerStore();

/**
 * Fine-grained Selector Hook using React 18 useSyncExternalStore
 */
export function usePlayerStore<T>(selector: (state: PlayerState) => T): T {
  return useSyncExternalStore(
    playerStore.subscribe,
    () => selector(playerStore.getState()),
    () => selector(initialState)
  );
}

// Specialized fine-grained hooks to prevent excessive re-renders:
export const useCurrentTrack = () => usePlayerStore((s) => s.currentTrack);
export const useIsPlaying = () => usePlayerStore((s) => s.isPlaying);
export const useCurrentTime = () => usePlayerStore((s) => s.currentTime);
export const useDuration = () => usePlayerStore((s) => s.duration);
export const useVolume = () => usePlayerStore((s) => s.volume);
export const useIsMuted = () => usePlayerStore((s) => s.isMuted);
export const useBassBoost = () => usePlayerStore((s) => s.bassBoost);
export const usePlaybackSpeed = () => usePlayerStore((s) => s.playbackSpeed);
export const usePlayQueue = () => usePlayerStore((s) => s.playQueue);
export const useRepeatMode = () => usePlayerStore((s) => s.repeatMode);
export const useIsShuffle = () => usePlayerStore((s) => s.isShuffle);

