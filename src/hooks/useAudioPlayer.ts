import { useEffect, useRef, useCallback } from 'react';
import { Track } from '../types';
import { audioEngine } from '../services/audioEngine';
import { youtubeEngine } from '../services/youtubeEngine';
import { MediaSessionService } from '../services/mediaSessionService';
import { StorageService } from '../services/storageService';
import { LyricsService } from '../services/lyricsService';
import { playerStore, usePlayerStore } from '../stores/playerStore';

export function useAudioPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const bassBoost = usePlayerStore((s) => s.bassBoost);
  const trebleBoost = usePlayerStore((s) => s.trebleBoost);
  const playbackSpeed = usePlayerStore((s) => s.playbackSpeed);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const playQueue = usePlayerStore((s) => s.playQueue);

  // Keep track of active blob URL to revoke on track change and avoid memory leaks
  const activeBlobUrlRef = useRef<string | null>(null);

  const cleanupBlobUrl = useCallback(() => {
    if (activeBlobUrlRef.current) {
      try {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      } catch {}
      activeBlobUrlRef.current = null;
    }
  }, []);

  // Sync engine callbacks to store
  useEffect(() => {
    audioEngine.onTimeUpdate = (curr, dur) => {
      playerStore.setTime(curr, dur);
    };

    audioEngine.onPlayStateChange = (playing) => {
      playerStore.setState({ isPlaying: playing });
    };

    youtubeEngine.onTimeUpdate = (curr, dur) => {
      playerStore.setTime(curr, dur);
    };

    youtubeEngine.onPlayStateChange = (playing) => {
      playerStore.setState({ isPlaying: playing });
    };

    return () => {
      audioEngine.onTimeUpdate = undefined;
      audioEngine.onPlayStateChange = undefined;
      youtubeEngine.onTimeUpdate = undefined;
      youtubeEngine.onPlayStateChange = undefined;
      cleanupBlobUrl();
    };
  }, [cleanupBlobUrl]);

  // Sync Volume to engines
  useEffect(() => {
    const effectiveVol = isMuted ? 0 : volume;
    audioEngine.setVolume(effectiveVol);
    youtubeEngine.setVolume(effectiveVol);
  }, [volume, isMuted]);

  // Sync Audio DSP to audioEngine
  useEffect(() => {
    audioEngine.setBassBoost(bassBoost);
    audioEngine.setTrebleBoost(trebleBoost);
  }, [bassBoost, trebleBoost]);

  // Sync Playback Speed
  useEffect(() => {
    audioEngine.setPlaybackRate(playbackSpeed);
    youtubeEngine.setPlaybackRate(playbackSpeed);
  }, [playbackSpeed]);

  const playTrack = useCallback(
    async (track: Track, startSeconds: number = 0) => {
      cleanupBlobUrl();
      playerStore.setState({ currentTrack: track, isPlaying: true, currentTime: startSeconds });

      const isYt = track.source === 'youtube' || Boolean(track.youtubeId);

      if (isYt) {
        audioEngine.stop();
        const ytId =
          track.youtubeId || (track.audioUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];
        if (ytId) {
          await youtubeEngine.loadAndPlay(ytId, startSeconds);
        }
      } else {
        youtubeEngine.stop();
        const offlineBlob = await StorageService.getOfflineAudioBlob(track.id);
        if (offlineBlob) {
          const blobUrl = URL.createObjectURL(offlineBlob);
          activeBlobUrlRef.current = blobUrl;
          await audioEngine.loadAndPlay(blobUrl, startSeconds);
        } else {
          await audioEngine.loadAndPlay(track.audioUrl, startSeconds);
        }
      }

      // Prefetch synced lyrics
      LyricsService.getLyrics(track)
        .then((res) => {
          if (res?.synced && res.synced.length > 0) {
            track.lyrics = res.synced;
          }
        })
        .catch(() => {});

      // Update Media Session
      MediaSessionService.updateMetadata(track);
    },
    [cleanupBlobUrl]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    const isYt = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);

    if (isPlaying) {
      if (isYt) {
        youtubeEngine.pause();
      } else {
        audioEngine.pause();
      }
      playerStore.setState({ isPlaying: false });
    } else {
      if (isYt) {
        const ytId =
          currentTrack.youtubeId || (currentTrack.audioUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];
        if (!youtubeEngine.getCurrentVideoId() || (ytId && ytId !== youtubeEngine.getCurrentVideoId())) {
          if (ytId) youtubeEngine.loadAndPlay(ytId, currentTime);
        } else {
          youtubeEngine.play();
        }
      } else {
        if (!audioEngine.hasSource()) {
          audioEngine.loadAndPlay(currentTrack.audioUrl, currentTime);
        } else {
          audioEngine.play();
        }
      }
      playerStore.setState({ isPlaying: true });
    }
  }, [currentTrack, isPlaying, currentTime]);

  const seek = useCallback((seconds: number) => {
    if (!isFinite(seconds)) return;
    const isYt = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);
    if (isYt) {
      youtubeEngine.seek(seconds);
    } else {
      audioEngine.seek(seconds);
    }
    playerStore.setTime(seconds);
  }, [currentTrack]);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    bassBoost,
    trebleBoost,
    playbackSpeed,
    repeatMode,
    isShuffle,
    playQueue,
    playTrack,
    togglePlay,
    seek,
  };
}
