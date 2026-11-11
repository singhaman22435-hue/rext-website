import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Track } from '../types';
import { youtubeEngine } from '../services/youtubeEngine';
import { audioEngine } from '../services/audioEngine';
import { LyricsService, LyricsResult } from '../services/lyricsService';
import { searchUniversalMusic } from '../services/musicCatalog';
import {
  Heart,
  Play,
  Pause,
  Flame,
  Plus,
  Share2,
  ChevronUp,
  ChevronDown,
  X,
  Film,
  Mic2,
  Sparkles,
  Shuffle,
  Headphones,
  RotateCcw
} from 'lucide-react';

interface VibesViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  onPlayFullSong: (track: Track, startTime?: number) => void;
  onClose: () => void;
  likedIds: string[];
  onToggleLike: (trackId: string) => void;
  onAddToPlaylist: (track: Track) => void;
  bassBoost: number;
  onBassChange: (db: number) => void;
  showToast: (msg: string) => void;
}

// Aesthetic ambient video canvas loops based on genre / vibe
const CANVAS_LOOPS: Record<string, string> = {
  electronic: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-with-neon-lights-41584-large.mp4',
  phonk: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-with-neon-lights-41584-large.mp4',
  lofi: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-glass-of-a-window-41598-large.mp4',
  pop: 'https://assets.mixkit.co/videos/preview/mixkit-stage-lights-at-a-concert-40283-large.mp4',
  hiphop: 'https://assets.mixkit.co/videos/preview/mixkit-stage-lights-at-a-concert-40283-large.mp4',
  default: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-41249-large.mp4'
};

// Search keywords used for auto-replenishing fresh trending clips
const DISCOVERY_QUERIES = [
  'viral reel songs',
  'trending music shorts',
  'top hits 2025',
  'punjabi viral songs',
  'phonk drift',
  'global billboard hits',
  'bollywood romantic songs'
];

export const VibesView: React.FC<VibesViewProps> = ({
  tracks,
  currentTrack,
  onPlayFullSong,
  onClose,
  likedIds,
  onToggleLike,
  onAddToPlaylist,
  bassBoost,
  onBassChange,
  showToast,
}) => {
  // Infinite Dynamic Feed State: Shuffled on entry so every visit is fresh!
  const [feedTracks, setFeedTracks] = useState<Track[]>(() => {
    const initial = tracks && tracks.length > 0 ? [...tracks] : [];
    // Randomize order for a fresh experience each time
    const shuffled = initial.sort(() => Math.random() - 0.5);
    // If a current track was playing, put it first
    if (currentTrack) {
      const filtered = shuffled.filter((t) => t.id !== currentTrack.id);
      return [currentTrack, ...filtered];
    }
    return shuffled;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [queryIndex, setQueryIndex] = useState(0);

  const activeTrack = feedTracks[currentIndex] || feedTracks[0];

  // Visual presentation mode: 'video' (Full-Bleed 9:16) | 'lyrics' (Kinetic Typography over dimmed video) | 'canvas' (Aesthetic Loop)
  const [visualMode, setVisualMode] = useState<'video' | 'lyrics' | 'canvas'>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [hookStartTime, setHookStartTime] = useState(45);
  const [lyricsData, setLyricsData] = useState<LyricsResult | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const videoAnchorRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto-replenish: Fetch more fresh trending music clips when reaching end of feed
  const loadMoreClips = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const q = DISCOVERY_QUERIES[queryIndex % DISCOVERY_QUERIES.length];
      setQueryIndex((prev) => prev + 1);

      const moreTracks = await searchUniversalMusic(q);
      if (moreTracks && moreTracks.length > 0) {
        setFeedTracks((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const newUnique = moreTracks.filter((t) => !existingIds.has(t.id));
          if (newUnique.length > 0) {
            showToast(`🔥 +${newUnique.length} new viral clips added to feed!`);
            return [...prev, ...newUnique];
          }
          return prev;
        });
      }
    } catch (e) {
      console.warn('Auto-replenish notice:', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, queryIndex, showToast]);

  // Shuffle & Refresh entire feed on demand ("Har baar new clips")
  const handleShuffleFeed = () => {
    setFeedTracks((prev) => {
      const shuffled = [...prev].sort(() => Math.random() - 0.5);
      return shuffled;
    });
    setCurrentIndex(0);
    showToast('✨ Fresh music clips shuffled!');
    // Also trigger prefetch of next batch
    loadMoreClips();
  };

  // Pre-load more clips when 3 clips away from the bottom
  useEffect(() => {
    if (currentIndex >= feedTracks.length - 3) {
      loadMoreClips();
    }
  }, [currentIndex, feedTracks.length, loadMoreClips]);

  // Hook start calculation: Estimate chorus drop timestamp
  useEffect(() => {
    if (!activeTrack) return;
    const estimated = activeTrack.duration ? Math.min(Math.floor(activeTrack.duration * 0.28), 60) : 45;
    setHookStartTime(estimated);
    setCurrentTime(0);
  }, [activeTrack?.id]);

  // Load Synced Lyrics for Active Track
  useEffect(() => {
    if (!activeTrack) return;
    LyricsService.getLyrics(activeTrack).then((res) => {
      setLyricsData(res);
    });
  }, [activeTrack?.id]);

  // Play snippet when active track or hook time changes
  useEffect(() => {
    if (!activeTrack) return;

    let isMounted = true;
    const isYt = Boolean(activeTrack.youtubeId || activeTrack.source === 'youtube');

    if (isYt) {
      audioEngine.stop();
      const ytId =
        activeTrack.youtubeId ||
        (activeTrack.audioUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];
      if (ytId) {
        youtubeEngine.loadAndPlay(ytId, hookStartTime);
        setIsPlaying(true);
      }
    } else {
      youtubeEngine.stop();
      audioEngine.loadAndPlay(activeTrack.audioUrl);
      audioEngine.seek(hookStartTime);
      audioEngine.setBassBoost(bassBoost);
      setIsPlaying(true);
    }

    // Snippet progress ticker (loops 35s preview)
    const timer = setInterval(() => {
      if (!isMounted) return;
      setCurrentTime((prev) => {
        if (prev >= 35) {
          // Loop back to hook start
          if (isYt) {
            youtubeEngine.seek(hookStartTime);
          } else {
            audioEngine.seek(hookStartTime);
          }
          return 0;
        }
        return prev + 0.25;
      });
    }, 250);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [activeTrack?.id, hookStartTime]);

  // Dedicated Visual Anchor Synchronization with full-bleed 9:16 vertical crop
  useEffect(() => {
    // In both 'video' and 'lyrics' mode, keep the YouTube video playing as the backdrop!
    if ((visualMode === 'video' || visualMode === 'lyrics') && videoAnchorRef.current) {
      youtubeEngine.setAnchor(videoAnchorRef.current, 'vibes-view', true);
    } else {
      youtubeEngine.clearAnchor('vibes-view');
    }
    return () => {
      youtubeEngine.clearAnchor('vibes-view');
    };
  }, [visualMode, currentIndex, activeTrack?.id]);

  // Cleanup on unmount of VibesView
  useEffect(() => {
    return () => {
      youtubeEngine.clearAnchor('vibes-view');
    };
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (feedTracks.length === 0) return;
    setCurrentIndex((prev) => {
      if (prev + 1 >= feedTracks.length) {
        loadMoreClips();
        return (prev + 1) % feedTracks.length;
      }
      return prev + 1;
    });
  }, [feedTracks.length, loadMoreClips]);

  const handlePrev = useCallback(() => {
    if (feedTracks.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + feedTracks.length) % feedTracks.length);
  }, [feedTracks.length]);

  // Keyboard navigation (ArrowUp, ArrowDown, Space, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Touch Swipe gestures (Mobile Reels)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) {
      // Swiped Up -> Next Reel
      handleNext();
    } else if (diff < -50) {
      // Swiped Down -> Previous Reel
      handlePrev();
    }
    touchStartY.current = null;
  };

  const togglePlay = () => {
    if (isPlaying) {
      youtubeEngine.pause();
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      youtubeEngine.play();
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  // Double tap to like with heart animation
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as React.MouseEvent).clientY;

    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);

    if (activeTrack && !likedIds.includes(activeTrack.id)) {
      onToggleLike(activeTrack.id);
      showToast(`❤️ Added "${activeTrack.title}" to Liked Songs`);
    }

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: {
          x: clientX ? clientX / window.innerWidth : 0.5,
          y: clientY ? clientY / window.innerHeight : 0.5,
        },
        colors: ['#FF5500', '#FF1744', '#FF4081'],
      });
    } catch {}
  };

  // Cycle Bass Boost right on the Reel
  const cycleBass = () => {
    const next = bassBoost === 0 ? 6 : bassBoost === 6 ? 12 : bassBoost === 12 ? 18 : 0;
    onBassChange(next);
    audioEngine.setBassBoost(next);
    showToast(`⚡ Sub-Bass Impact: +${next} dB`);
  };

  // Current active synced lyric text
  const lyrics = lyricsData?.synced && lyricsData.synced.length > 0 ? lyricsData.synced : activeTrack?.lyrics || [];
  const currentActualTime = hookStartTime + currentTime;
  let activeLyric = '';
  for (let i = 0; i < lyrics.length; i++) {
    if (currentActualTime >= lyrics[i].time) {
      activeLyric = lyrics[i].text;
    } else {
      break;
    }
  }

  const isLiked = activeTrack ? likedIds.includes(activeTrack.id) : false;
  const loopPercent = Math.min(100, (currentTime / 35) * 100);

  // Genre video loop URL
  const genreKey = activeTrack?.genre?.toLowerCase() || 'default';
  const canvasVideoUrl = CANVAS_LOOPS[genreKey] || CANVAS_LOOPS.default;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center select-none overflow-hidden animate-fade-in"
      style={{
        overscrollBehavior: 'contain',
        minHeight: '100dvh',
        height: '100dvh'
      }}
    >
      {/* Background Dynamic Ambient Blur (Desktop/Tablet) */}
      <div
        className="hidden sm:block absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${activeTrack?.coverUrl})` }}
      />

      {/* Main Full-Screen Reel Frame (100% full-bleed on mobile, 9:16 card on desktop) */}
      <div className="relative w-full h-full sm:max-w-[420px] sm:max-h-[88vh] sm:rounded-3xl overflow-hidden bg-black shadow-2xl sm:border sm:border-white/10 flex flex-col justify-between sm:my-auto">
        
        {/* Layer 1: Center-Cropped YouTube Video Anchor (9:16 Ratio Full-Bleed) */}
        <div
          ref={videoAnchorRef}
          id="rext-vibes-video-anchor"
          className="absolute inset-0 w-full h-full overflow-hidden bg-black z-10"
        >
          {/* Ambient poster while video buffers */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-md scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${activeTrack?.coverUrl})` }}
          />
        </div>

        {/* Dimmer for Lyrics Mode: dims video so neon typography pops */}
        {visualMode === 'lyrics' && (
          <div className="absolute inset-0 z-15 bg-black/60 backdrop-blur-[2px] pointer-events-none transition-opacity duration-300" />
        )}

        {/* Layer 2: Looping Video Canvas (Canvas Mode) */}
        {visualMode === 'canvas' && (
          <div className="absolute inset-0 z-15 overflow-hidden pointer-events-none">
            <video
              autoPlay
              loop
              muted
              playsInline
              src={canvasVideoUrl}
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          </div>
        )}

        {/* Top Header Navigation Bar (Responsive, safe-area padded) */}
        <div
          className="relative z-30 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-auto"
          style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))' }}
        >
          {/* Left: Close & Vibes Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition-all flex items-center justify-center active:scale-90"
              title="Close Vibes (ESC)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
              <Flame className="w-3.5 h-3.5 text-[var(--accent-orange)] animate-pulse" />
              <span className="text-[11px] font-black tracking-wider uppercase">VIBES</span>
            </div>
          </div>

          {/* Center: 3-Way Mode Switcher (Clip vs Lyrics vs Canvas) */}
          <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/15">
            <button
              onClick={() => setVisualMode('video')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                visualMode === 'video'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Watch Clip"
            >
              <Film className="w-3 h-3" />
              <span>Clip</span>
            </button>

            <button
              onClick={() => setVisualMode('lyrics')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                visualMode === 'lyrics'
                  ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Synced Lyrics"
            >
              <Mic2 className="w-3 h-3" />
              <span>Lyrics</span>
            </button>

            <button
              onClick={() => setVisualMode('canvas')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                visualMode === 'canvas'
                  ? 'bg-[var(--accent-blue)] text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Aesthetic Canvas"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden xs:inline">Canvas</span>
            </button>
          </div>

          {/* Right: Fresh Clips Shuffle Button ("Har baar new clips") */}
          <button
            onClick={handleShuffleFeed}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition-all flex items-center justify-center active:scale-90 text-[var(--accent-orange)]"
            title="Get Fresh Clips (Shuffle)"
            aria-label="Shuffle Feed"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Center Touch & Kinetic Lyric Stage */}
        <div
          onClick={togglePlay}
          onDoubleClick={handleDoubleTap}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center cursor-pointer pointer-events-auto"
        >
          {/* Heart Pop Animation on Double Tap */}
          {showHeartBurst && (
            <div className="absolute z-50 pointer-events-none animate-scale-up">
              <Heart className="w-24 h-24 text-red-500 fill-current filter drop-shadow-[0_0_24px_rgba(239,68,68,0.8)]" />
            </div>
          )}

          {/* Pause / Play Indicator when paused */}
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl mb-4 animate-scale-up">
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </div>
          )}

          {/* Dynamic Synced Typography (Prominent in Lyrics Mode) */}
          {visualMode === 'lyrics' && (
            <div className="max-w-xs space-y-3 px-3 animate-fade-in pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[var(--accent-orange)]/40 text-[10px] uppercase font-bold tracking-widest text-[var(--accent-orange)] shadow-lg">
                ⚡ Synced Chorus Drop
              </span>
              <p className="font-extrabold leading-snug text-2xl sm:text-3xl text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] filter drop-shadow-[0_0_12px_rgba(255,85,0,0.6)]">
                {activeLyric || activeTrack.title}
              </p>
              <p className="text-xs text-white/80 font-semibold drop-shadow">
                {activeTrack.artist}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Information & Action Bar */}
        <div
          className="relative z-30 flex items-end justify-between px-3 sm:px-4 pb-4 sm:pb-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none"
          style={{ paddingBottom: 'max(1.2rem, env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Bottom Left: Track Info & "Play Full Song" Button */}
          <div className="flex-1 min-w-0 pr-3 space-y-2 pointer-events-auto">
            {/* Genre & Quality Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md border border-white/15 text-[10px] font-bold text-[var(--accent-orange)]">
                {activeTrack.genre}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/80">
                1080p DSP
              </span>
              {bassBoost > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-[var(--accent-orange)] text-white text-[10px] font-mono font-bold">
                  +{bassBoost}dB Bass
                </span>
              )}
            </div>

            {/* Title & Artist */}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-white truncate drop-shadow">
                {activeTrack.title}
              </h3>
              <p className="text-xs text-white/80 truncate font-semibold">
                {activeTrack.artist}
              </p>
            </div>

            {/* Quick 1-Line Lyric in Clip Mode */}
            {visualMode !== 'lyrics' && activeLyric && (
              <p className="text-[11px] text-white/70 italic truncate max-w-[240px] drop-shadow">
                "{activeLyric}"
              </p>
            )}

            {/* Primary Action: "Play Full Song" in Main Player */}
            <button
              onClick={() => onPlayFullSong(activeTrack, hookStartTime + currentTime)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)] to-[#FF7A26] hover:scale-102 active:scale-95 text-white font-bold text-xs shadow-lg shadow-[var(--accent-glow)] transition-all group"
            >
              <Headphones className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Play Full Song</span>
            </button>
          </div>

          {/* Bottom Right: Action Rail (Instagram Reels / TikTok Style) */}
          <div className="flex flex-col items-center gap-3 shrink-0 pointer-events-auto">
            {/* Like Button */}
            <button
              onClick={() => onToggleLike(activeTrack.id)}
              className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
              title={isLiked ? 'Liked' : 'Like'}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/15 transition-all ${
                  isLiked
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105'
                    : 'bg-black/50 text-white hover:bg-black/75 group-hover:scale-105'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-bold text-white/90">
                {isLiked ? 'Liked' : 'Like'}
              </span>
            </button>

            {/* Bass Boost Toggle */}
            <button
              onClick={cycleBass}
              className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
              title="Boost Bass"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/15 transition-all ${
                  bassBoost > 0
                    ? 'bg-[var(--accent-orange)] text-white shadow-lg shadow-orange-500/50 scale-105'
                    : 'bg-black/50 text-white hover:bg-black/75 group-hover:scale-105'
                }`}
              >
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white/90 font-mono">
                {bassBoost > 0 ? `+${bassBoost}dB` : 'Bass'}
              </span>
            </button>

            {/* Add to Playlist */}
            <button
              onClick={() => onAddToPlaylist(activeTrack)}
              className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
              title="Add to Playlist"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md border border-white/15 group-hover:scale-105 transition-all">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white/90">Add</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: activeTrack.title,
                    text: `Listen to "${activeTrack.title}" by ${activeTrack.artist} on REXT!`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('🔗 Link copied to clipboard!');
                }
              }}
              className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
              title="Share Track"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md border border-white/15 group-hover:scale-105 transition-all">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white/90">Share</span>
            </button>

            {/* Next Clip Skip Button */}
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90 transition-all mt-1"
              title="Next Clip (Swipe Up)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Snippet Progress Line */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-40">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-orange)] to-red-500 transition-all duration-300"
            style={{ width: `${loopPercent}%` }}
          />
        </div>
      </div>

      {/* Floating Desktop Navigation Arrows */}
      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">
        <button
          onClick={handlePrev}
          className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-110 active:scale-95 shadow-xl"
          title="Previous Reel (Arrow Up)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-110 active:scale-95 shadow-xl"
          title="Next Reel (Arrow Down)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
