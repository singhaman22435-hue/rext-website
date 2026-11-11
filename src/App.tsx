import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Track,
  Playlist,
  ViewType,
  DownloadItem,
  EqualizerBand,
  EqualizerPreset,
  ThemeMode,
  FontStyle
} from './types';
import {
  audioEngine,
  DEFAULT_EQ_BANDS,
  EQ_PRESETS
} from './services/audioEngine';
import {
  CURATED_TRACKS,
  FEATURED_PLAYLISTS,
  GENRES,
  searchUniversalMusic
} from './services/musicCatalog';
import { StorageService } from './services/storageService';
import { DownloadService } from './services/downloadService';
import { youtubeEngine } from './services/youtubeEngine';
import { MediaSessionService } from './services/mediaSessionService';
import { LyricsService } from './services/lyricsService';
import { shareTrack } from './utils/shareUtils';

// Components
import { SplashScreen } from './components/SplashScreen';
import {
  TrackRowSkeleton,
  PlaylistCardSkeleton,
  HeroBannerSkeleton
} from './components/SkeletonLoader';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { TrackRow } from './components/TrackRow';
import { TrackCard } from './components/TrackCard';
import { PlaylistCard } from './components/PlaylistCard';
import { BassLabModal } from './components/BassLabModal';
import { LyricsModal } from './components/LyricsModal';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { MiniVideoPlayer } from './components/MiniVideoPlayer';
import { DownloadManagerModal } from './components/DownloadManagerModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ImportAudioModal } from './components/ImportAudioModal';
import { PremiumUpgradeModal } from './components/PremiumUpgradeModal';
import { InstallAppModal } from './components/InstallAppModal';
import { MobileNav } from './components/MobileNav';
import { MobileLibraryDrawer } from './components/MobileLibraryDrawer';
import { QueueModal } from './components/QueueModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { OfflineBanner } from './components/OfflineBanner';
import { TrackActionMenu } from './components/TrackActionMenu';
import { VibesView } from './components/VibesView';
import { proService } from './services/proService';

import {
  Play,
  Pause,
  Flame,
  HardDrive,
  Heart,
  Music,
  LayoutGrid,
  List,
  ArrowUpDown,
  Plus,
  Sliders,
  Disc,
  ListMusic,
  TrendingUp,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

export const App: React.FC = () => {
  // Splash & Skeleton Loading
  const [showSplash, setShowSplash] = useState(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  // Background Theme
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('rext_theme') as ThemeMode;
    if (saved && ['warmer', 'sunset', 'cold', 'mocha'].includes(saved)) {
      return saved;
    }
    return 'warmer';
  });

  const [currentFont, setCurrentFont] = useState<FontStyle>(() => {
    return (localStorage.getItem('rext_font') as FontStyle) || 'outfit';
  });

  // View & Navigation
  const [currentView, setCurrentView] = useState<ViewType>(() => 
    typeof window !== 'undefined' && window.location.hash === '#vibes' ? 'vibes' : 'home'
  );
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'bass' | 'plays' | 'title'>('default');

  // Tracks & Playback State
  const [tracks, setTracks] = useState<Track[]>(CURATED_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(CURATED_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(CURATED_TRACKS[0]?.duration || 214);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Queue ("Up Next")
  const [playQueue, setPlayQueue] = useState<Track[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Custom User Playlists
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>(() =>
    StorageService.getUserPlaylists()
  );
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [playlistTargetTrack, setPlaylistTargetTrack] = useState<Track | null>(null);

  // Sleep Timer
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(null); // ms or -1 for end of song

  // Search History
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    StorageService.getSearchHistory()
  );

  // Equalizer & Bass State
  const [bassBoost, setBassBoost] = useState(6);
  const [trebleBoost, setTrebleBoost] = useState(1);
  const [spatialAudio, setSpatialAudio] = useState(false);
  const [eqBands, setEqBands] = useState<EqualizerBand[]>(DEFAULT_EQ_BANDS);
  const [activePresetId, setActivePresetId] = useState('club-punch');

  // Likes & Downloads Storage
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});

  // 3-Dots Action Menu State
  const [actionMenuTrack, setActionMenuTrack] = useState<Track | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<DOMRect | null>(null);

  // Toast Feedback Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isBassLabOpen, setIsBassLabOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isProUser, setIsProUser] = useState(() => proService.isPro());
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Listen to PWA install and pro status
  useEffect(() => {
    const handleProChange = (e: any) => {
      setIsProUser(Boolean(e.detail?.isPro));
    };
    window.addEventListener('rext-pro-change', handleProChange);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('rext-pro-change', handleProChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (installPrompt && typeof installPrompt.prompt === 'function') {
      try {
        installPrompt.prompt();
        const outcome = await installPrompt.userChoice;
        if (outcome.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      } catch {}
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const handleToggleVideo = () => {
    const next = !isVideoVisible;
    setIsVideoVisible(next);
    youtubeEngine.setVideoVisibility(next);
  };

  const handleFocusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const input = document.querySelector('header input[type="text"]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  };

  // --- Stack Navigation & Popstate History (Mobile Back Button Support) ---
  const pushNavState = useCallback((type: string, detail?: any) => {
    try {
      window.history.pushState({ rextState: true, type, detail, timestamp: Date.now() }, '');
    } catch {}
  }, []);

  const handleNavigateView = useCallback((view: ViewType) => {
    if (currentView === view && !selectedPlaylist) return;
    pushNavState('view', { view });
    setCurrentView(view);
    setSelectedPlaylist(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'vibes') {
      window.location.hash = '#vibes';
    } else if (window.location.hash === '#vibes') {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}
    }
  }, [currentView, selectedPlaylist, pushNavState]);

  const handleSelectPlaylist = useCallback((pl: Playlist) => {
    pushNavState('playlist', { playlistId: pl.id });
    setSelectedPlaylist(pl);
    setCurrentView('home');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pushNavState]);

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      if (selectedPlaylist) {
        setSelectedPlaylist(null);
      } else if (currentView !== 'home') {
        setCurrentView('home');
      } else if (searchQuery) {
        setSearchQuery('');
      }
    }
  }, [selectedPlaylist, currentView, searchQuery]);

  const openModal = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>, name: string) => {
    pushNavState('modal', { name });
    setter(true);
  }, [pushNavState]);

  // Handle Browser / Mobile Hardware Back Button (Popstate)
  useEffect(() => {
    if (!window.history.state?.rextState) {
      window.history.replaceState({ rextState: true, type: 'root' }, '');
    }

    const handlePopState = () => {
      // 1. Dismiss overlays in priority order
      if (actionMenuTrack) {
        setActionMenuTrack(null);
        return;
      }
      if (isFullscreenOpen) {
        setIsFullscreenOpen(false);
        return;
      }
      if (isLyricsOpen) {
        setIsLyricsOpen(false);
        return;
      }
      if (isBassLabOpen) {
        setIsBassLabOpen(false);
        return;
      }
      if (isQueueOpen) {
        setIsQueueOpen(false);
        return;
      }
      if (isDownloadsOpen) {
        setIsDownloadsOpen(false);
        return;
      }
      if (isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
        return;
      }
      if (isCreatePlaylistOpen) {
        setIsCreatePlaylistOpen(false);
        return;
      }
      if (isAddToPlaylistOpen) {
        setIsAddToPlaylistOpen(false);
        return;
      }
      if (isSleepTimerOpen) {
        setIsSleepTimerOpen(false);
        return;
      }
      if (isProModalOpen) {
        setIsProModalOpen(false);
        return;
      }
      if (isInstallModalOpen) {
        setIsInstallModalOpen(false);
        return;
      }
      if (isShortcutsOpen) {
        setIsShortcutsOpen(false);
        return;
      }
      if (isImportOpen) {
        setIsImportOpen(false);
        return;
      }

      // 2. Playlist drilldown back
      if (selectedPlaylist) {
        setSelectedPlaylist(null);
        return;
      }

      // 3. Search query clear
      if (searchQuery.trim().length > 0) {
        setSearchQuery('');
        return;
      }

      // 4. Secondary view return to Home
      if (currentView !== 'home') {
        setCurrentView('home');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    actionMenuTrack,
    isFullscreenOpen,
    isLyricsOpen,
    isBassLabOpen,
    isQueueOpen,
    isDownloadsOpen,
    isMobileDrawerOpen,
    isCreatePlaylistOpen,
    isAddToPlaylistOpen,
    isSleepTimerOpen,
    isProModalOpen,
    isInstallModalOpen,
    isShortcutsOpen,
    isImportOpen,
    selectedPlaylist,
    searchQuery,
    currentView
  ]);

  // Apply Theme & Font dynamically
  useEffect(() => {
    document.documentElement.className = `theme-${currentTheme}`;
    document.body.className = `theme-${currentTheme} font-${currentFont} text-[var(--text-main)] antialiased transition-colors duration-300`;
    localStorage.setItem('rext_theme', currentTheme);
  }, [currentTheme, currentFont]);

  const handleThemeChange = (theme: ThemeMode) => {
    setCurrentTheme(theme);
  };

  const handleFontChange = (font: FontStyle) => {
    setCurrentFont(font);
    localStorage.setItem('rext_font', font);
  };

  // Unified Seek handler
  const handleSeek = useCallback(
    (time: number) => {
      setCurrentTime(time);
      if (currentTrack?.youtubeId || currentTrack?.source === 'youtube') {
        youtubeEngine.seek(time);
      } else {
        audioEngine.seek(time);
      }
    },
    [currentTrack]
  );

  // Play a track
  const handlePlayTrack = useCallback(
    async (track: Track, startSeconds: number = 0) => {
      setCurrentTrack(track);
      if (startSeconds > 0) {
        setCurrentTime(startSeconds);
      }
      StorageService.addRecentTrack(track.id);

      const isYt = Boolean(track.youtubeId || track.source === 'youtube');

      if (isYt) {
        audioEngine.stop();
        const ytId =
          track.youtubeId || (track.audioUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];
        if (ytId) {
          await youtubeEngine.loadAndPlay(ytId, startSeconds);
          youtubeEngine.setVolume(isMuted ? 0 : volume);
          if (youtubeEngine.player?.setPlaybackRate) {
            try {
              youtubeEngine.player.setPlaybackRate(playbackSpeed);
            } catch {}
          }
        }
      } else {
        youtubeEngine.stop();
        const offlineBlob = await StorageService.getOfflineAudioBlob(track.id);
        if (offlineBlob) {
          const blobUrl = URL.createObjectURL(offlineBlob);
          await audioEngine.loadAndPlay(blobUrl);
        } else {
          await audioEngine.loadAndPlay(track.audioUrl);
        }
        if (startSeconds > 0) {
          audioEngine.seek(startSeconds);
        }
        audioEngine.setBassBoost(bassBoost);
        audioEngine.setTrebleBoost(trebleBoost);
        audioEngine.setVolume(isMuted ? 0 : volume);
        if (audioEngine.audioElement) {
          audioEngine.audioElement.playbackRate = playbackSpeed;
        }
      }

      // Prefetch synced lyrics in background for instant lyrics/fullscreen
      LyricsService.getLyrics(track)
        .then((res) => {
          if (res?.synced && res.synced.length > 0) {
            track.lyrics = res.synced;
          }
        })
        .catch(() => {});

      setIsPlaying(true);
    },
    [bassBoost, trebleBoost, volume, isMuted, playbackSpeed]
  );

  const handleTogglePlay = useCallback(() => {
    if (!currentTrack) return;
    const isYt = Boolean(currentTrack.youtubeId || currentTrack.source === 'youtube');
    if (isPlaying) {
      if (isYt) {
        youtubeEngine.pause();
      } else {
        audioEngine.pause();
      }
      setIsPlaying(false);
      StorageService.setLastPlayback(currentTrack.id, currentTime);
    } else {
      if (isYt) {
        if (!youtubeEngine.getCurrentVideoId()) {
          const ytId =
            currentTrack.youtubeId || (currentTrack.audioUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];
          if (ytId) {
            youtubeEngine.loadAndPlay(ytId, currentTime);
          }
        } else {
          youtubeEngine.play();
        }
      } else {
        if (!audioEngine.audioElement?.src) {
          audioEngine.loadAndPlay(currentTrack.audioUrl);
          if (currentTime > 0) audioEngine.seek(currentTime);
        } else {
          audioEngine.play();
        }
      }
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying, currentTime]);

  // Next / Previous Track (checks repeatMode and playQueue first!)
  const handleNextTrack = useCallback(() => {
    // 0. Repeat Single Track Mode
    if (repeatMode === 'one' && currentTrack) {
      handleSeek(0);
      if (!isPlaying) {
        if (currentTrack.youtubeId || currentTrack.source === 'youtube') {
          youtubeEngine.play();
        } else {
          audioEngine.play();
        }
        setIsPlaying(true);
      }
      return;
    }

    // Check if sleep timer was set for end of current song
    if (sleepTimerEnd === -1) {
      if (isPlaying) handleTogglePlay();
      setSleepTimerEnd(null);
      showToast('🌙 Sleep timer finished - playback paused');
      return;
    }

    // 1. Play from queue if queue has songs
    if (playQueue.length > 0) {
      const [nextQueued, ...rest] = playQueue;
      setPlayQueue(rest);
      handlePlayTrack(nextQueued);
      return;
    }

    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    let nextIndex: number;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }

    if (tracks[nextIndex]) {
      handlePlayTrack(tracks[nextIndex]);
    }
  }, [
    repeatMode,
    currentTrack,
    handleSeek,
    sleepTimerEnd,
    isPlaying,
    handleTogglePlay,
    playQueue,
    tracks,
    isShuffle,
    handlePlayTrack,
    showToast
  ]);

  const handlePrevTrack = useCallback(() => {
    if (!currentTrack) return;
    if (currentTime > 4) {
      handleSeek(0);
      return;
    }
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    if (tracks[prevIndex]) {
      handlePlayTrack(tracks[prevIndex]);
    }
  }, [currentTrack, currentTime, handleSeek, tracks, handlePlayTrack]);

  // Deep-linking URL check & initial data on mount
  useEffect(() => {
    const loadedLikes = StorageService.getLikedTrackIds();
    setLikedIds(loadedLikes);

    StorageService.getDownloadItems().then((items) => {
      setDownloads(items);
    });

    // Check deep link parameter e.g. ?track=... or ?v=...
    const params = new URLSearchParams(window.location.search);
    const deepParam = params.get('track') || params.get('v');
    if (deepParam) {
      const match = CURATED_TRACKS.find(
        (t) => t.id === deepParam || t.youtubeId === deepParam
      );
      if (match) {
        handlePlayTrack(match);
      } else if (deepParam.length === 11 || deepParam.startsWith('yt-')) {
        const cleanId = deepParam.replace('yt-', '');
        const directYtTrack: Track = {
          id: `yt-${cleanId}`,
          youtubeId: cleanId,
          source: 'youtube',
          title: 'Direct Shared Track',
          artist: 'YouTube Stream',
          album: 'Shared via Link',
          coverUrl: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
          audioUrl: `https://www.youtube.com/watch?v=${cleanId}`,
          duration: 220,
          genre: 'Pop',
          bitrate: 'YouTube HQ',
          year: new Date().getFullYear(),
        };
        handlePlayTrack(directYtTrack);
      }
    } else {
      const last = StorageService.getLastPlayback();
      if (last) {
        const found = CURATED_TRACKS.find((t) => t.id === last.trackId);
        if (found) {
          setCurrentTrack(found);
          setCurrentTime(last.time);
          setDuration(found.duration);
        }
      }
    }

    const loadTimer = setTimeout(() => {
      setIsCatalogLoading(false);
    }, 400);

    return () => clearTimeout(loadTimer);
  }, [handlePlayTrack]);

  // Periodically persist playback position for exact resume
  useEffect(() => {
    if (currentTrack && currentTime > 0) {
      StorageService.setLastPlayback(currentTrack.id, currentTime);
    }
  }, [currentTrack?.id, Math.floor(currentTime / 3)]);

  // Connect Audio & YouTube Engine Callbacks
  useEffect(() => {
    audioEngine.onTimeUpdate = (curr, dur) => {
      if (!currentTrack?.youtubeId && currentTrack?.source !== 'youtube') {
        setCurrentTime(curr);
        if (dur > 0) setDuration(dur);
      }
    };

    audioEngine.onPlayStateChange = (playing) => {
      if (!currentTrack?.youtubeId && currentTrack?.source !== 'youtube') {
        setIsPlaying(playing);
      }
    };

    audioEngine.onEnded = () => {
      if (!currentTrack?.youtubeId && currentTrack?.source !== 'youtube') {
        handleNextTrack();
      }
    };

    youtubeEngine.onTimeUpdate = (curr, dur) => {
      if (currentTrack?.youtubeId || currentTrack?.source === 'youtube') {
        setCurrentTime(curr);
        if (dur > 0) setDuration(dur);
      }
    };

    youtubeEngine.onPlayStateChange = (playing) => {
      if (currentTrack?.youtubeId || currentTrack?.source === 'youtube') {
        setIsPlaying(playing);
      }
    };

    youtubeEngine.onEnded = () => {
      if (currentTrack?.youtubeId || currentTrack?.source === 'youtube') {
        handleNextTrack();
      }
    };
  }, [currentTrack, handleNextTrack]);

  // MediaSession API Integration (Lockscreen, Notification, Bluetooth Headphone buttons)
  useEffect(() => {
    MediaSessionService.init({
      onPlay: handleTogglePlay,
      onPause: handleTogglePlay,
      onNext: handleNextTrack,
      onPrev: handlePrevTrack,
      onSeek: handleSeek,
    });
  }, [handleTogglePlay, handleNextTrack, handlePrevTrack, handleSeek]);

  useEffect(() => {
    MediaSessionService.updateMetadata(currentTrack);
  }, [currentTrack]);

  useEffect(() => {
    MediaSessionService.updatePlaybackState(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    MediaSessionService.updatePositionState(currentTime, duration, playbackSpeed);
  }, [currentTime, duration, playbackSpeed]);

  // Sleep Timer Countdown Tick
  useEffect(() => {
    if (!sleepTimerEnd || sleepTimerEnd === -1) return;

    const interval = setInterval(() => {
      if (Date.now() >= sleepTimerEnd) {
        if (isPlaying) {
          handleTogglePlay();
        }
        setSleepTimerEnd(null);
        showToast('🌙 Sleep timer ended - playback paused');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEnd, isPlaying, handleTogglePlay, showToast]);

  // Playback Speed Setter
  const handleSetPlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioEngine.audioElement) {
      audioEngine.audioElement.playbackRate = speed;
    }
    if (youtubeEngine.player && youtubeEngine.player.setPlaybackRate) {
      try {
        youtubeEngine.player.setPlaybackRate(speed);
      } catch {}
    }
    showToast(`Playback speed: ${speed}x`);
  };

  // Sleep timer setter
  const handleSetSleepTimer = (val: number | 'end-of-track' | null) => {
    if (val === null) {
      setSleepTimerEnd(null);
      showToast('Sleep timer canceled');
    } else if (val === 'end-of-track') {
      setSleepTimerEnd(-1);
      showToast('Sleep timer set: pause at end of this song');
    } else {
      const endTime = Date.now() + val * 60000;
      setSleepTimerEnd(endTime);
      showToast(`Sleep timer set for ${val} minutes`);
    }
  };

  // Queue actions
  const handlePlayNext = (track: Track) => {
    setPlayQueue((prev) => [track, ...prev.filter((t) => t.id !== track.id)]);
    showToast(`"${track.title}" will play next`);
  };

  const handleAddToQueue = (track: Track) => {
    setPlayQueue((prev) => [...prev, track]);
    showToast(`Added "${track.title}" to Up Next queue`);
  };

  const handleRemoveFromQueue = (index: number) => {
    setPlayQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearQueue = () => {
    setPlayQueue([]);
    showToast('Queue cleared');
  };

  const handleMoveQueueItem = (fromIndex: number, toIndex: number) => {
    setPlayQueue((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const handlePlayQueueTrack = (index: number) => {
    const track = playQueue[index];
    if (track) {
      setPlayQueue((prev) => prev.filter((_, i) => i !== index));
      handlePlayTrack(track);
    }
  };

  // Custom User Playlists
  const handleCreatePlaylist = (name: string, description: string) => {
    const created = StorageService.createUserPlaylist(name, description);
    setUserPlaylists(StorageService.getUserPlaylists());
    showToast(`Created playlist "${name}"`);
  };

  const handleToggleTrackInPlaylist = (playlistId: string, trackId: string) => {
    const pl = userPlaylists.find((p) => p.id === playlistId);
    if (pl) {
      if (pl.trackIds.includes(trackId)) {
        StorageService.removeTrackFromPlaylist(playlistId, trackId);
        showToast(`Removed from "${pl.name}"`);
      } else {
        StorageService.addTrackToPlaylist(playlistId, trackId);
        showToast(`Added to "${pl.name}"`);
      }
      setUserPlaylists(StorageService.getUserPlaylists());
    }
  };

  // Share Song Action
  const handleShareTrack = async (track: Track) => {
    const res = await shareTrack(track);
    showToast(res.message);
  };

  // Action Menu
  const handleOpenActionMenu = (track: Track, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActionMenuTrack(track);
    setActionMenuAnchor(e.currentTarget.getBoundingClientRect());
  };

  // Likes & Downloads handlers
  const handleToggleLike = (trackId: string) => {
    const updated = StorageService.toggleLikeTrack(trackId);
    setLikedIds(updated);
    if (updated.includes(trackId)) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.85 } });
    }
  };

  const handleDownloadTrack = async (track: Track) => {
    if (downloads.some((d) => d.trackId === track.id)) {
      showToast(`"${track.title}" is already in your downloads`);
      return;
    }

    setDownloadingIds((prev) => ({ ...prev, [track.id]: 20 }));

    try {
      let blobSize = '4.2 MB';
      try {
        setDownloadingIds((prev) => ({ ...prev, [track.id]: 50 }));
        const resp = await fetch(track.audioUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          await StorageService.saveOfflineAudioBlob(track.id, blob);
          blobSize = `${(blob.size / (1024 * 1024)).toFixed(1)} MB`;
        }
      } catch {
        // Fallback for CORS streams - still saves track metadata to IndexedDB
      }

      setDownloadingIds((prev) => ({ ...prev, [track.id]: 80 }));

      const newItem: DownloadItem = {
        id: `dl-${track.id}`,
        trackId: track.id,
        track,
        blobSize,
        downloadedAt: Date.now(),
      };
      await StorageService.saveDownloadItem(newItem);

      const updated = await StorageService.getDownloadItems();
      setDownloads(updated);

      setDownloadingIds((prev) => ({ ...prev, [track.id]: 100 }));

      // Also trigger device download (MP3 file onto phone/computer)
      const res = await DownloadService.downloadTrackToDevice(track);
      showToast(res.message || `Saved "${track.title}" to downloads!`);
    } catch {
      showToast(`Saving "${track.title}"...`);
      await DownloadService.downloadTrackToDevice(track);
    } finally {
      setTimeout(() => {
        setDownloadingIds((prev) => {
          const next = { ...prev };
          delete next[track.id];
          return next;
        });
      }, 500);
    }
  };

  const handleDeleteDownload = async (trackId: string) => {
    await StorageService.removeDownloadItem(trackId);
    const updated = await StorageService.getDownloadItems();
    setDownloads(updated);
    showToast('Removed from offline downloads');
  };

  // Volume & Bass & Treble
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(false);
    audioEngine.setVolume(vol);
    youtubeEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setVolume(nextMute ? 0 : volume);
    youtubeEngine.setVolume(nextMute ? 0 : volume);
  };

  const handleBassChange = (db: number) => {
    setBassBoost(db);
    audioEngine.setBassBoost(db);
  };

  const handleTrebleChange = (db: number) => {
    setTrebleBoost(db);
    audioEngine.setTrebleBoost(db);
  };

  const handleSpatialToggle = (enabled: boolean) => {
    setSpatialAudio(enabled);
    audioEngine.setSpatialAudio(enabled);
  };

  const handleEqBandChange = (index: number, gain: number) => {
    const updated = [...eqBands];
    updated[index].gain = gain;
    setEqBands(updated);
    audioEngine.setEqGain(index, gain);
  };

  const handleSelectPreset = (preset: EqualizerPreset) => {
    setActivePresetId(preset.id);
    handleBassChange(preset.bassBoost);
    const updated = eqBands.map((band, idx) => ({
      ...band,
      gain: preset.gains[idx] || 0,
    }));
    setEqBands(updated);
    audioEngine.applyPreset(preset);
  };

  // Add custom track (URL or uploaded file)
  const handleAddCustomTrack = (track: Track) => {
    setTracks((prev) => [track, ...prev]);
    handlePlayTrack(track);
  };

  // Live Music Search: local + iTunes live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTracks(CURATED_TRACKS);
      setIsSearchingOnline(false);
      return;
    }

    setIsSearchingOnline(true);
    const timer = setTimeout(async () => {
      const results = await searchUniversalMusic(searchQuery);
      setTracks(results);
      setIsSearchingOnline(false);

      // Save to recent search history
      if (searchQuery.trim().length >= 2) {
        StorageService.addSearchHistory(searchQuery.trim());
        setSearchHistory(StorageService.getSearchHistory());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtered & Sorted Tracks
  const displayedTracks = useMemo(() => {
    let result = [...tracks];

    // Views
    if (currentView === 'liked') {
      result = result.filter((t) => likedIds.includes(t.id));
    } else if (currentView === 'downloads') {
      const dlIds = downloads.map((d) => d.trackId);
      result = result.filter((t) => dlIds.includes(t.id));
    } else if (currentView === 'youtube') {
      result = result.filter((t) => Boolean(t.youtubeId || t.source === 'youtube'));
    } else if (selectedPlaylist) {
      result = result.filter((t) => selectedPlaylist.trackIds.includes(t.id));
    } else if (!searchQuery.trim() && selectedGenre !== 'all') {
      const g = selectedGenre.toLowerCase();
      result = result.filter((t) => {
        const tGenre = t.genre.toLowerCase();
        if (g === 'pop') return tGenre === 'pop' || tGenre.includes('pop');
        if (g === 'hiphop') return tGenre.includes('hip-hop') || tGenre.includes('trap');
        if (g === 'phonk') return tGenre.includes('phonk');
        if (g === 'lofi') return tGenre.includes('lo-fi') || tGenre.includes('chill');
        if (g === 'edm')
          return tGenre.includes('edm') || tGenre.includes('dance') || tGenre.includes('electronic');
        if (g === 'desi')
          return tGenre.includes('desi') || tGenre.includes('punjabi') || tGenre.includes('bollywood');
        if (g === 'rock') return tGenre.includes('rock') || tGenre.includes('metal');
        if (g === 'acoustic') return tGenre.includes('acoustic') || tGenre.includes('ambient');
        return tGenre.includes(g);
      });
    }

    // Sort
    if (sortBy === 'bass') {
      result.sort((a, b) => (b.bassLevel || 0) - (a.bassLevel || 0));
    } else if (sortBy === 'plays') {
      result.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [tracks, currentView, likedIds, downloads, selectedPlaylist, searchQuery, selectedGenre, sortBy]);

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 relative overflow-x-hidden">
      {/* Offline Connectivity Banner */}
      <OfflineBanner onOpenDownloads={() => setIsDownloadsOpen(true)} />

      {/* Splash Screen on initial load */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div className="flex flex-1 pb-40 sm:pb-32 md:pb-28">
        {/* Left Sidebar (Desktop) */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigateView}
          playlists={FEATURED_PLAYLISTS}
          userPlaylists={userPlaylists}
          selectedPlaylistId={selectedPlaylist?.id || null}
          onSelectPlaylist={handleSelectPlaylist}
          onOpenCreatePlaylist={() => openModal(setIsCreatePlaylistOpen, 'create-playlist')}
          bassBoost={bassBoost}
          likedCount={likedIds.length}
          downloadCount={downloads.length}
          totalTracksCount={tracks.length}
          isPro={isProUser}
          onOpenProModal={() => openModal(setIsProModalOpen, 'pro')}
          onOpenInstallModal={() => openModal(setIsInstallModalOpen, 'install')}
        />

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col min-w-0">
          <Navbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            bassBoost={bassBoost}
            onOpenBassLab={() => openModal(setIsBassLabOpen, 'bass-lab')}
            downloadCount={downloads.length}
            onOpenDownloads={() => openModal(setIsDownloadsOpen, 'downloads')}
            onOpenShortcuts={() => openModal(setIsShortcutsOpen, 'shortcuts')}
            isSearchingOnline={isSearchingOnline}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            currentFont={currentFont}
            onFontChange={handleFontChange}
            isPro={isProUser}
            onOpenProModal={() => openModal(setIsProModalOpen, 'pro')}
            onOpenMobileDrawer={() => openModal(setIsMobileDrawerOpen, 'drawer')}
            onOpenVibes={() => handleNavigateView('vibes')}
            searchHistory={searchHistory}
            onSelectSearchHistory={(term) => {
              setSearchQuery(term);
              StorageService.addSearchHistory(term);
              setSearchHistory(StorageService.getSearchHistory());
            }}
            onClearSearchHistory={() => {
              StorageService.clearSearchHistory();
              setSearchHistory([]);
            }}
          />

          {/* Main Feed Content */}
          <div className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl w-full mx-auto">
            {/* Hero / Playlist Header Banner */}
            {selectedPlaylist ? (
              <div className="space-y-4">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] text-xs font-bold text-[var(--text-main)] shadow-xs transition-colors"
                  aria-label="Back to Previous View"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--accent-orange)]" />
                  <span>Back to Home</span>
                </button>
                <div className="relative p-4 sm:p-6 md:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-lg flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-fade-in">
                  <img
                    src={selectedPlaylist.coverUrl}
                    alt={selectedPlaylist.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-xl border border-[var(--border-color)] shrink-0"
                  />
                  <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                    <span className="text-xs uppercase font-mono tracking-widest text-[var(--accent-orange)] font-bold">
                      Playlist
                    </span>
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)] truncate">
                      {selectedPlaylist.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl">
                      {selectedPlaylist.description}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                      <button
                        onClick={() => displayedTracks[0] && handlePlayTrack(displayedTracks[0])}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent-orange)] text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" /> Play All
                      </button>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        {displayedTracks.length} Songs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentView === 'liked' ? (
              <div className="space-y-4">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] text-xs font-bold text-[var(--text-main)] shadow-xs transition-colors"
                  aria-label="Back to Home"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--accent-orange)]" />
                  <span>Back to Home</span>
                </button>
                <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[var(--accent-orange)]/15 to-pink-500/15 border border-[var(--accent-orange)]/30 flex items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-lg shrink-0">
                    <Heart className="w-7 h-7 sm:w-10 sm:h-10 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)]">
                      Liked Songs
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      {likedIds.length} tracks you have marked as your favorites
                    </p>
                  </div>
                </div>
              </div>
            ) : currentView === 'downloads' ? (
              <div className="space-y-4">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] text-xs font-bold text-[var(--text-main)] shadow-xs transition-colors"
                  aria-label="Back to Home"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--accent-orange)]" />
                  <span>Back to Home</span>
                </button>
                <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[var(--accent-blue)]/15 to-cyan-500/15 border border-[var(--accent-blue)]/30 flex items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[var(--accent-blue)] text-white flex items-center justify-center shadow-lg shrink-0">
                    <HardDrive className="w-7 h-7 sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)]">
                      Offline Downloads Vault
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      {downloads.length} tracks saved securely in IndexedDB
                    </p>
                  </div>
                </div>
              </div>
            ) : currentView === 'youtube' ? (
              <div className="space-y-4">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] text-xs font-bold text-[var(--text-main)] shadow-xs transition-colors"
                  aria-label="Back to Home"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--accent-orange)]" />
                  <span>Back to Home</span>
                </button>
                <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[var(--accent-orange)]/15 to-pink-500/15 border border-[var(--accent-orange)]/30 flex items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[var(--accent-orange)] to-pink-500 text-white flex items-center justify-center shadow-lg shrink-0">
                    <TrendingUp className="w-7 h-7 sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-main)]">
                      Trending Global Charts
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Top trending music worldwide in 320 kbps studio audio with live synced lyrics
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Home Hero Banner */
              <div className="relative p-6 md:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 z-10 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-mono font-bold border border-[var(--accent-orange)]/30">
                    <Flame className="w-3.5 h-3.5" /> High-Res Audio Engine Active
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-main)]">
                    Feel Every Beat.
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md">
                    Hi-res pure audio streaming, live millisecond karaoke sync, sub-bass tuning, and offline MP3 downloads.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                    <button
                      onClick={() => handlePlayTrack(CURATED_TRACKS[0])}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-orange)] text-white text-xs font-bold shadow-lg shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" /> Listen Now
                    </button>
                    <button
                      onClick={() => openModal(setIsQueueOpen, 'queue')}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold text-[var(--text-main)] transition-all"
                    >
                      <ListMusic className="w-4 h-4 text-[var(--accent-blue)]" /> Up Next (
                      {playQueue.length})
                    </button>
                  </div>
                </div>
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--border-color)] shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600"
                    alt="Rext Music"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className="text-xs font-bold text-white">Studio Master 24-bit</span>
                  </div>
                </div>
              </div>
            )}

            {/* Featured Playlists Carousel (Only in Home View) */}
            {currentView === 'home' && !selectedPlaylist && !searchQuery && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Disc className="w-4 h-4 text-[var(--accent-orange)]" /> Featured Collections
                  </h3>
                  <button
                    onClick={() => openModal(setIsCreatePlaylistOpen, 'create-playlist')}
                    className="text-xs font-bold text-[var(--accent-orange)] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Playlist
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {FEATURED_PLAYLISTS.slice(0, 5).map((pl) => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      onSelect={() => handleSelectPlaylist(pl)}
                      onPlayDirect={() => {
                        const target = tracks.find((t) => pl.trackIds.includes(t.id));
                        if (target) handlePlayTrack(target);
                      }}
                      isCurrent={selectedPlaylist?.id === pl.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Track Feed Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[var(--text-main)]">
                    {selectedPlaylist
                      ? 'Playlist Tracks'
                      : currentView === 'liked'
                      ? 'Liked Favorites'
                      : currentView === 'downloads'
                      ? 'Downloaded Tracks'
                      : currentView === 'youtube'
                      ? 'Trending Global Hits'
                      : searchQuery
                      ? `Search: "${searchQuery}"`
                      : 'Popular Hits & Master Recordings'}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[var(--text-muted)] font-bold">
                    {displayedTracks.length}
                  </span>
                </div>

                {/* Sort & Layout Controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 text-xs">
                    <button
                      onClick={() => setLayoutMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        layoutMode === 'grid'
                          ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                          : 'text-[var(--text-muted)]'
                      }`}
                      title="Grid Layout"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setLayoutMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        layoutMode === 'list'
                          ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                          : 'text-[var(--text-muted)]'
                      }`}
                      title="List Layout"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="bass">Sort: Deepest Bass</option>
                    <option value="plays">Sort: Most Played</option>
                    <option value="title">Sort: Song Title (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Tracks Listing */}
              {isCatalogLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <PlaylistCardSkeleton key={i} />
                  ))}
                </div>
              ) : displayedTracks.length > 0 ? (
                layoutMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                    {displayedTracks.map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        isPlaying={isPlaying && currentTrack?.id === track.id}
                        isCurrent={currentTrack?.id === track.id}
                        isLiked={likedIds.includes(track.id)}
                        isDownloaded={downloads.some((d) => d.trackId === track.id)}
                        isDownloading={Boolean(downloadingIds[track.id])}
                        downloadProgress={downloadingIds[track.id] || 0}
                        onPlay={() => handlePlayTrack(track)}
                        onToggleLike={() => handleToggleLike(track.id)}
                        onDownload={() => handleDownloadTrack(track)}
                        onOpenMenu={handleOpenActionMenu}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {displayedTracks.map((track, idx) => (
                      <TrackRow
                        key={track.id}
                        index={idx}
                        track={track}
                        isPlaying={isPlaying && currentTrack?.id === track.id}
                        isCurrent={currentTrack?.id === track.id}
                        isLiked={likedIds.includes(track.id)}
                        isDownloaded={downloads.some((d) => d.trackId === track.id)}
                        isDownloading={Boolean(downloadingIds[track.id])}
                        downloadProgress={downloadingIds[track.id] || 0}
                        onPlay={() => handlePlayTrack(track)}
                        onToggleLike={() => handleToggleLike(track.id)}
                        onDownload={() => handleDownloadTrack(track)}
                        onOpenMenu={handleOpenActionMenu}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="py-16 text-center space-y-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6">
                  <Music className="w-10 h-10 text-[var(--text-sub)] mx-auto opacity-70" />
                  <h4 className="text-base font-bold text-[var(--text-main)]">No songs found</h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    Try searching for another artist or song, or click "Import" to play any custom audio.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action / Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-black/90 dark:bg-zinc-900/90 text-white border border-white/20 shadow-2xl backdrop-blur-xl text-xs font-semibold animate-slide-up flex items-center gap-2 pointer-events-none">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Track 3-Dots Action Menu */}
      {actionMenuTrack && (
        <TrackActionMenu
          isOpen={Boolean(actionMenuTrack)}
          onClose={() => setActionMenuTrack(null)}
          track={actionMenuTrack}
          anchorRect={actionMenuAnchor}
          onPlayNext={handlePlayNext}
          onAddToQueue={handleAddToQueue}
          onAddToPlaylist={(t) => {
            setPlaylistTargetTrack(t);
            setIsAddToPlaylistOpen(true);
          }}
          onShare={handleShareTrack}
          onViewLyrics={() => {
            setCurrentTrack(actionMenuTrack);
            setIsLyricsOpen(true);
          }}
          isLiked={likedIds.includes(actionMenuTrack.id)}
          onToggleLike={handleToggleLike}
          isDownloaded={downloads.some((d) => d.trackId === actionMenuTrack.id)}
          onToggleDownload={(t) => {
            if (downloads.some((d) => d.trackId === t.id)) {
              handleDeleteDownload(t.id);
            } else {
              handleDownloadTrack(t);
            }
          }}
        />
      )}

      {/* Player Bar */}
      {currentView !== 'vibes' && (
        <PlayerBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onNext={handleNextTrack}
          onPrev={handlePrevTrack}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isShuffle={isShuffle}
          onToggleShuffle={() => setIsShuffle((prev) => !prev)}
          repeatMode={repeatMode}
          onCycleRepeat={() =>
            setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
          }
          bassBoost={bassBoost}
          onBassChange={handleBassChange}
          isLiked={currentTrack ? likedIds.includes(currentTrack.id) : false}
          onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
          isDownloaded={currentTrack ? downloads.some((d) => d.trackId === currentTrack.id) : false}
          isDownloading={currentTrack ? Boolean(downloadingIds[currentTrack.id]) : false}
          downloadProgress={currentTrack ? downloadingIds[currentTrack.id] || 0 : 0}
          onDownload={() => currentTrack && handleDownloadTrack(currentTrack)}
          onOpenBassLab={() => openModal(setIsBassLabOpen, 'bass-lab')}
          onOpenLyrics={() => openModal(setIsLyricsOpen, 'lyrics')}
          onOpenFullscreen={() => openModal(setIsFullscreenOpen, 'fullscreen')}
          isVideoVisible={isVideoVisible}
          onToggleVideo={handleToggleVideo}
          onOpenQueue={() => openModal(setIsQueueOpen, 'queue')}
          queueCount={playQueue.length}
          onOpenSleepTimer={() => openModal(setIsSleepTimerOpen, 'sleep')}
          sleepTimerEnd={sleepTimerEnd}
          playbackSpeed={playbackSpeed}
        />
      )}

      {/* Modals */}
      <QueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentTrack={currentTrack}
        queue={playQueue}
        onPlayQueueTrack={handlePlayQueueTrack}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        onMoveQueueItem={handleMoveQueueItem}
      />

      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      <AddToPlaylistModal
        isOpen={isAddToPlaylistOpen}
        onClose={() => {
          setIsAddToPlaylistOpen(false);
          setPlaylistTargetTrack(null);
        }}
        track={playlistTargetTrack}
        userPlaylists={userPlaylists}
        onToggleTrackInPlaylist={handleToggleTrackInPlaylist}
        onOpenCreatePlaylist={() => openModal(setIsCreatePlaylistOpen, 'create-playlist')}
      />

      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        sleepTimerEnd={sleepTimerEnd}
        onSetSleepTimer={handleSetSleepTimer}
        playbackSpeed={playbackSpeed}
        onSetPlaybackSpeed={handleSetPlaybackSpeed}
      />

      <BassLabModal
        isOpen={isBassLabOpen}
        onClose={() => setIsBassLabOpen(false)}
        bassBoost={bassBoost}
        onBassChange={handleBassChange}
        trebleBoost={trebleBoost}
        onTrebleChange={handleTrebleChange}
        spatialAudio={spatialAudio}
        onSpatialToggle={handleSpatialToggle}
        eqBands={eqBands}
        onEqBandChange={handleEqBandChange}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
      />

      <LyricsModal
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
        track={currentTrack}
        currentTime={currentTime}
        onSeek={handleSeek}
      />

      <MiniVideoPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onOpenFullscreen={() => setIsFullscreenOpen(true)}
        onCloseVideo={handleToggleVideo}
        isVisible={isVideoVisible && Boolean(currentTrack) && !isFullscreenOpen && currentView !== 'vibes'}
      />

      <FullscreenPlayer
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        bassBoost={bassBoost}
        onBassChange={handleBassChange}
        isLiked={currentTrack ? likedIds.includes(currentTrack.id) : false}
        onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
      />

      {/* REXT Vibes (Shorts / Reels Feed) Fullscreen Experience */}
      {currentView === 'vibes' && (
        <VibesView
          tracks={tracks}
          currentTrack={currentTrack}
          onPlayFullSong={(track, startTime) => {
            handleNavigateView('home');
            handlePlayTrack(track, startTime);
            setIsFullscreenOpen(true);
          }}
          onClose={() => handleNavigateView('home')}
          likedIds={likedIds}
          onToggleLike={handleToggleLike}
          onAddToPlaylist={(track) => {
            setPlaylistTargetTrack(track);
            openModal(setIsAddToPlaylistOpen, 'add-to-playlist');
          }}
          bassBoost={bassBoost}
          onBassChange={handleBassChange}
          showToast={showToast}
        />
      )}

      <DownloadManagerModal
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        downloads={downloads}
        onPlayTrack={handlePlayTrack}
        onDeleteDownload={handleDeleteDownload}
        currentPlayingId={currentTrack?.id}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ImportAudioModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onAddTrack={handleAddCustomTrack}
      />

      <PremiumUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onSuccess={() => setIsProModalOpen(false)}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        installPrompt={installPrompt}
        onTriggerInstall={handleTriggerInstall}
      />

      {/* Mobile Bottom Navigation Bar (< md screens) */}
      {currentView !== 'vibes' && (
        <MobileNav
          currentView={currentView}
          onNavigate={handleNavigateView}
          likedCount={likedIds.length}
          downloadCount={downloads.length}
          onOpenBassLab={() => openModal(setIsBassLabOpen, 'bass-lab')}
          onOpenLibraryDrawer={() => openModal(setIsMobileDrawerOpen, 'drawer')}
          onFocusSearch={handleFocusSearch}
        />
      )}

      {/* Mobile Library & Settings Drawer */}
      <MobileLibraryDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        playlists={FEATURED_PLAYLISTS}
        userPlaylists={userPlaylists}
        selectedPlaylistId={selectedPlaylist?.id || null}
        onSelectPlaylist={(pl) => {
          handleSelectPlaylist(pl);
          setIsMobileDrawerOpen(false);
        }}
        onOpenCreatePlaylist={() => openModal(setIsCreatePlaylistOpen, 'create-playlist')}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        currentFont={currentFont}
        onFontChange={handleFontChange}
        onOpenImport={() => openModal(setIsImportOpen, 'import')}
        isPro={isProUser}
        onOpenProModal={() => openModal(setIsProModalOpen, 'pro')}
      />
    </div>
  );
};

export default App;
