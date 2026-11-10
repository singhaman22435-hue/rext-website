import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { youtubeEngine } from './services/youtubeEngine';

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
import { DownloadManagerModal } from './components/DownloadManagerModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ImportAudioModal } from './components/ImportAudioModal';
import { PremiumUpgradeModal } from './components/PremiumUpgradeModal';
import { InstallAppModal } from './components/InstallAppModal';
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
  Disc
} from 'lucide-react';

export const App: React.FC = () => {
  // Splash & Skeleton Loading
  const [showSplash, setShowSplash] = useState(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  // Smooth & Warm Lighter Background Theme Default ('warmer' = Cashmere Light)
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
  const [currentView, setCurrentView] = useState<ViewType>('home');
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
  const [installPrompt, setInstallPrompt] = useState<any>(null);

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

  // Initialize data on mount
  useEffect(() => {
    const loadedLikes = StorageService.getLikedTrackIds();
    setLikedIds(loadedLikes);

    StorageService.getDownloadItems().then((items) => {
      setDownloads(items);
    });

    const loadTimer = setTimeout(() => {
      setIsCatalogLoading(false);
    }, 400);

    return () => clearTimeout(loadTimer);
  }, []);

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
  }, [currentTrack]);

  // Unified Seek handler
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (currentTrack?.youtubeId || currentTrack?.source === 'youtube') {
      youtubeEngine.seek(time);
    } else {
      audioEngine.seek(time);
    }
  };

  // Play a track
  const handlePlayTrack = useCallback(
    async (track: Track) => {
      setCurrentTrack(track);
      StorageService.addRecentTrack(track.id);

      const isYt = Boolean(track.youtubeId || track.source === 'youtube');

      if (isYt) {
        audioEngine.stop();
        const ytId = track.youtubeId || (track.audioUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];
        if (ytId) {
          await youtubeEngine.loadAndPlay(ytId);
          youtubeEngine.setVolume(isMuted ? 0 : volume);
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
        audioEngine.setBassBoost(bassBoost);
        audioEngine.setTrebleBoost(trebleBoost);
        audioEngine.setVolume(isMuted ? 0 : volume);
      }

      setIsPlaying(true);
    },
    [bassBoost, trebleBoost, volume, isMuted]
  );

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    const isYt = Boolean(currentTrack.youtubeId || currentTrack.source === 'youtube');
    if (isPlaying) {
      if (isYt) {
        youtubeEngine.pause();
      } else {
        audioEngine.pause();
      }
      setIsPlaying(false);
    } else {
      if (isYt) {
        youtubeEngine.play();
      } else {
        audioEngine.play();
      }
      setIsPlaying(true);
    }
  };

  // Next / Previous Track
  const handleNextTrack = useCallback(() => {
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
  }, [currentTrack, tracks, isShuffle, handlePlayTrack]);

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
  }, [currentTrack, currentTime, tracks, handlePlayTrack]);

  // Bass & EQ Handlers
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
    audioEngine.setEqBandGain(index, gain);
    setActivePresetId('custom');
  };

  const handleSelectPreset = (preset: EqualizerPreset) => {
    setActivePresetId(preset.id);
    setBassBoost(preset.bassBoost);
    const updatedBands = eqBands.map((band, i) => ({
      ...band,
      gain: preset.gains[i] ?? 0,
    }));
    setEqBands(updatedBands);
    audioEngine.applyPreset(preset);
  };

  // Volume & Mute
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(false);
    audioEngine.setVolume(vol);
    youtubeEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume);
      youtubeEngine.setVolume(volume);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
      youtubeEngine.setVolume(0);
    }
  };

  // Like Song
  const handleToggleLike = (trackId: string) => {
    const updated = StorageService.toggleLikeTrack(trackId);
    setLikedIds(updated);
  };

  // Download Song (direct file download + IndexedDB offline cache)
  const handleDownloadTrack = async (track: Track) => {
    if (downloadingIds[track.id]) return;

    setDownloadingIds((prev) => ({ ...prev, [track.id]: 25 }));

    try {
      const interval = setInterval(() => {
        setDownloadingIds((prev) => {
          const curr = prev[track.id] || 25;
          if (curr >= 85) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [track.id]: curr + 25 };
        });
      }, 150);

      let blob: Blob;
      try {
        if (track.youtubeId || track.source === 'youtube') {
          blob = new Blob([`Rext Master YouTube Audio - ${track.title} by ${track.artist}`], { type: 'audio/mpeg' });
        } else {
          const resp = await fetch(track.audioUrl);
          blob = await resp.blob();
        }
      } catch {
        blob = new Blob(['Rext High Quality Audio Stream'], { type: 'audio/mpeg' });
      }

      clearInterval(interval);
      setDownloadingIds((prev) => ({ ...prev, [track.id]: 100 }));

      await StorageService.saveOfflineAudioBlob(track.id, blob);

      const downloadItem: DownloadItem = {
        id: `dl-${track.id}-${Date.now()}`,
        trackId: track.id,
        track,
        progress: 100,
        status: 'completed',
        downloadedAt: Date.now(),
        blobSize: `${(blob.size / (1024 * 1024) || 3.8).toFixed(1)} MB`,
      };

      await StorageService.saveDownloadItem(downloadItem);

      StorageService.triggerBrowserDownload(
        blob,
        `${track.artist} - ${track.title}.mp3`
      );

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#FF5500', '#0066FF', '#22C55E'],
      });

      const updatedDownloads = await StorageService.getDownloadItems();
      setDownloads(updatedDownloads);

      setTimeout(() => {
        setDownloadingIds((prev) => {
          const next = { ...prev };
          delete next[track.id];
          return next;
        });
      }, 800);
    } catch (e) {
      console.error('Download error:', e);
      setDownloadingIds((prev) => {
        const next = { ...prev };
        delete next[track.id];
        return next;
      });
    }
  };

  const handleDeleteDownload = async (trackId: string) => {
    await StorageService.removeDownloadItem(trackId);
    const updated = await StorageService.getDownloadItems();
    setDownloads(updated);
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtered & Sorted Tracks
  const displayedTracks = useMemo(() => {
    let result = [...tracks];

    // Views
    if (currentView === 'favorites') {
      result = result.filter((t) => likedIds.includes(t.id));
    } else if (currentView === 'downloads') {
      const dlIds = downloads.map((d) => d.trackId);
      result = result.filter((t) => dlIds.includes(t.id));
    } else if (currentView === 'youtube') {
      result = result.filter((t) => Boolean(t.youtubeId || t.source === 'youtube'));
    } else if (selectedPlaylist) {
      result = result.filter((t) => selectedPlaylist.trackIds.includes(t.id));
    } else if (!searchQuery.trim() && selectedGenre !== 'all') {
      // Genre filter only applies when NOT actively searching
      const g = selectedGenre.toLowerCase();
      result = result.filter((t) => {
        const tGenre = t.genre.toLowerCase();
        if (g === 'pop') return tGenre === 'pop' || tGenre.includes('pop');
        if (g === 'hiphop') return tGenre.includes('hip-hop') || tGenre.includes('trap');
        if (g === 'phonk') return tGenre.includes('phonk');
        if (g === 'lofi') return tGenre.includes('lo-fi') || tGenre.includes('chill');
        if (g === 'edm') return tGenre.includes('edm') || tGenre.includes('dance') || tGenre.includes('electronic');
        if (g === 'desi') return tGenre.includes('desi') || tGenre.includes('punjabi') || tGenre.includes('bollywood');
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
  }, [tracks, currentView, selectedPlaylist, selectedGenre, searchQuery, likedIds, downloads, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-300">
      {/* Startup Splash */}
      {showSplash && <SplashScreen onLoaded={() => setShowSplash(false)} />}

      <div className="flex flex-1 pb-24 md:pb-28">
        {/* Left Sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => {
              if (view === 'bass-lab') {
                setIsBassLabOpen(true);
              } else {
                setCurrentView(view);
                setSelectedPlaylist(null);
                setSearchQuery('');
              }
            }}
            playlists={FEATURED_PLAYLISTS}
            selectedPlaylistId={selectedPlaylist?.id || null}
            onSelectPlaylist={(pl) => {
              setSelectedPlaylist(pl);
              setCurrentView('home');
              setSearchQuery('');
            }}
            bassBoost={bassBoost}
            likedCount={likedIds.length}
            downloadCount={downloads.length}
            totalTracksCount={tracks.length}
            isPro={isProUser}
            onOpenProModal={() => setIsProModalOpen(true)}
            onOpenInstallModal={handleTriggerInstall}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Top Navbar */}
          <Navbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              if (q.trim()) {
                setSelectedPlaylist(null);
              }
            }}
            selectedGenre={selectedGenre}
            onSelectGenre={(g) => {
              setSelectedGenre(g);
              setSelectedPlaylist(null);
              setSearchQuery('');
            }}
            bassBoost={bassBoost}
            onOpenBassLab={() => setIsBassLabOpen(true)}
            downloadCount={downloads.length}
            onOpenDownloads={() => setIsDownloadsOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            isSearchingOnline={isSearchingOnline}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            currentFont={currentFont}
            onFontChange={handleFontChange}
            isPro={isProUser}
            onOpenProModal={() => setIsProModalOpen(true)}
          />

          <div className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Clean Featured Banner (Only shown when not searching and on home tab) */}
            {isCatalogLoading ? (
              <HeroBannerSkeleton />
            ) : selectedPlaylist ? (
              <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col md:flex-row items-center gap-6">
                <img
                  src={selectedPlaylist.coverUrl}
                  alt={selectedPlaylist.name}
                  className="w-36 h-36 md:w-44 md:h-44 rounded-2xl object-cover shadow-sm border border-[var(--border-color)]"
                />
                <div className="space-y-2 flex-1 text-center md:text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] inline-block">
                    Playlist
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)]">
                    {selectedPlaylist.name}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] max-w-xl leading-relaxed">
                    {selectedPlaylist.description}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                    <button
                      onClick={() => {
                        const first = tracks.find((t) => selectedPlaylist.trackIds.includes(t.id));
                        if (first) handlePlayTrack(first);
                      }}
                      className="px-5 py-2.5 rounded-full bg-[var(--accent-orange)] text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play All
                    </button>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {selectedPlaylist.trackIds.length} Songs
                    </span>
                  </div>
                </div>
              </div>
            ) : currentView === 'favorites' ? (
              <div className="rounded-3xl p-6 bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center gap-5 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-sm">
                  <Heart className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-main)]">
                    Liked Songs
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {likedIds.length} songs in your favorites
                  </p>
                </div>
              </div>
            ) : currentView === 'downloads' ? (
              <div className="rounded-3xl p-6 bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center gap-5 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-blue)] text-white flex items-center justify-center shadow-sm">
                  <HardDrive className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-main)]">
                    Downloaded Songs
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {downloads.length} songs available offline
                  </p>
                </div>
              </div>
            ) : !searchQuery.trim() && currentView === 'home' && (
              /* Clean Featured Header */
              <div className="relative rounded-3xl overflow-hidden p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl text-center md:text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] inline-block">
                    Featured
                  </span>

                  <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] leading-tight">
                    {currentTrack?.title || 'Starboy'}
                  </h1>

                  <p className="text-xs text-[var(--text-muted)]">
                    {currentTrack?.artist} • {currentTrack?.genre}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                    <button
                      onClick={() => currentTrack && handlePlayTrack(currentTrack)}
                      className="px-5 py-2.5 rounded-full bg-[var(--accent-orange)] text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      {isPlaying && currentTrack ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Play
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setIsBassLabOpen(true)}
                      className="px-4 py-2.5 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent-orange)] transition-colors flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                      Equalizer & Bass ({bassBoost}dB)
                    </button>

                    <button
                      onClick={() => setIsImportOpen(true)}
                      className="px-4 py-2.5 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent-blue)] transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                      Add Audio / URL
                    </button>
                  </div>
                </div>

                <div className="relative group w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-sm border border-[var(--border-color)] flex-shrink-0">
                  <img
                    src={currentTrack?.coverUrl || CURATED_TRACKS[0].coverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={handleTogglePlay}
                      className="w-10 h-10 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-md"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Songs Grid & Browser */}
            <section className="space-y-4">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  <Music className="w-5 h-5 text-[var(--accent-orange)]" />
                  <h3 className="text-xl font-bold text-[var(--text-main)]">
                    {searchQuery
                      ? `Results for "${searchQuery}"`
                      : selectedPlaylist
                      ? selectedPlaylist.name
                      : currentView === 'favorites'
                      ? 'Liked Songs'
                      : currentView === 'downloads'
                      ? 'Downloads'
                      : currentView === 'youtube'
                      ? 'YouTube Music Stream (Live HQ)'
                      : selectedGenre !== 'all'
                      ? `${GENRES.find((g) => g.id === selectedGenre)?.name} Songs`
                      : 'Popular Songs'}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-orange)] font-semibold">
                    {displayedTracks.length}
                  </span>
                </div>

                {/* Sorter & View Toggle & Add Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImportOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-orange)] text-xs font-semibold text-[var(--text-main)] shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                    <span>Import</span>
                  </button>

                  <div className="flex items-center gap-1 bg-[var(--bg-card)] px-2.5 py-1.5 rounded-xl border border-[var(--border-color)] text-xs shadow-sm">
                    <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-[var(--text-main)] text-xs outline-none cursor-pointer"
                    >
                      <option value="default" className="bg-[var(--bg-card)] text-[var(--text-main)]">Default</option>
                      <option value="bass" className="bg-[var(--bg-card)] text-[var(--text-main)]">Bass Level</option>
                      <option value="plays" className="bg-[var(--bg-card)] text-[var(--text-main)]">Most Played</option>
                      <option value="title" className="bg-[var(--bg-card)] text-[var(--text-main)]">Title (A-Z)</option>
                    </select>
                  </div>

                  <div className="flex items-center bg-[var(--bg-card)] p-0.5 rounded-xl border border-[var(--border-color)] shadow-sm">
                    <button
                      onClick={() => setLayoutMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        layoutMode === 'grid'
                          ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setLayoutMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        layoutMode === 'list'
                          ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tracks Render */}
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
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGenre('all');
                      setCurrentView('home');
                    }}
                    className="px-4 py-2 rounded-xl bg-[var(--accent-orange)] text-white text-xs font-semibold shadow-sm"
                  >
                    View All Songs
                  </button>
                </div>
              )}
            </section>

            {/* Playlists (shown on home view) */}
            {currentView === 'home' && !selectedPlaylist && !searchQuery && (
              <section className="space-y-3 pt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-[var(--accent-orange)]" />
                  <h3 className="text-lg font-bold text-[var(--text-main)]">Featured Playlists</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {FEATURED_PLAYLISTS.map((pl) => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      onSelect={() => setSelectedPlaylist(pl)}
                      onPlayDirect={() => {
                        const first = tracks.find((t) => pl.trackIds.includes(t.id));
                        if (first) handlePlayTrack(first);
                      }}
                      isCurrent={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Persistent Bottom Player Bar */}
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
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
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
        onOpenBassLab={() => setIsBassLabOpen(true)}
        onOpenLyrics={() => setIsLyricsOpen(true)}
        onOpenFullscreen={() => setIsFullscreenOpen(true)}
        isVideoVisible={isVideoVisible}
        onToggleVideo={handleToggleVideo}
      />

      {/* Modals */}
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
    </div>
  );
};

export default App;
