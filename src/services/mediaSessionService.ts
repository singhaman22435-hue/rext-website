import { Track } from '../types';

interface MediaSessionCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
}

export class MediaSessionService {
  private static callbacks: MediaSessionCallbacks | null = null;
  private static isInitialized = false;

  static init(callbacks: MediaSessionCallbacks) {
    this.callbacks = callbacks;
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (!this.isInitialized) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          this.callbacks?.onPlay();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          this.callbacks?.onPause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.callbacks?.onPrev();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.callbacks?.onNext();
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && this.callbacks) {
            this.callbacks.onSeek(details.seekTime);
          }
        });

        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skipTime = details.seekOffset || 10;
          // seek back
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details.seekOffset || 10;
          // seek forward
        });

        this.isInitialized = true;
      } catch (e) {
        console.warn('MediaSession handler registration failed:', e);
      }
    }
  }

  static updateMetadata(track: Track | null) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !track) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'Rext Music Master',
        artwork: [
          {
            src: track.coverUrl,
            sizes: '512x512',
            type: 'image/jpeg',
          },
          {
            src: track.coverUrl,
            sizes: '256x256',
            type: 'image/jpeg',
          },
          {
            src: track.coverUrl,
            sizes: '128x128',
            type: 'image/jpeg',
          },
        ],
      });
    } catch (e) {
      console.warn('Failed to update MediaMetadata:', e);
    }
  }

  static updatePlaybackState(isPlaying: boolean) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) {
      // ignore
    }
  }

  static updatePositionState(currentTime: number, duration: number, playbackRate = 1.0) {
    if (
      typeof window === 'undefined' ||
      !('mediaSession' in navigator) ||
      !('setPositionState' in navigator.mediaSession) ||
      isNaN(currentTime) ||
      isNaN(duration) ||
      duration <= 0
    ) {
      return;
    }

    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, duration),
        playbackRate: Math.max(0.1, playbackRate),
        position: Math.max(0, Math.min(currentTime, duration)),
      });
    } catch {
      // ignore position update failure on fast ticks
    }
  }
}

