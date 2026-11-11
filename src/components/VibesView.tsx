import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Track } from '../types';
import { youtubeEngine } from '../services/youtubeEngine';
import { audioEngine } from '../services/audioEngine';
import { LyricsService, LyricsResult } from '../services/lyricsService';
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
  Disc,
  Headphones,
  Sliders
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
  // Ensure we have a valid list of tracks
  const feedTracks = tracks && tracks.length > 0 ? tracks : [];
  
  // Find initial index
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!currentTrack || feedTracks.length === 0) return 0;
    const idx = feedTracks.findIndex((t) => t.id === currentTrack.id);
    return idx >= 0 ? idx : 0;
  });

  const activeTrack = feedTracks[currentIndex] || feedTracks[0];

  // Visual presentation mode: 'video' (YouTube 9:16) | 'canvas' (Looping Aesthetic) | 'lyrics' (Kinetic Typography)
  const [visualMode, setVisualMode] = useState<'video' | 'canvas' | 'lyrics'>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // 30-sec preview snippet
  const [hookStartTime, setHookStartTime] = useState(45); // default chorus drop
  const [lyricsData, setLyricsData] = useState<LyricsResult | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [heartCoords, setHeartCoords] = useState<{ x: number; y: number } | null>(null);

  const videoAnchorRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Hook start calculation: Estimate chorus drop timestamp
  useEffect(() => {
    if (!activeTrack) return;
    // Smart hook estimation: 1/4 into the track or ~45s
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

    // Snippet progress ticker (loops 30s preview)
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

  // Dedicated Visual Anchor Synchronization for 9:16 Vertical Video Mode
  useEffect(() => {
    if (visualMode === 'video' && videoAnchorRef.current) {
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
    setCurrentIndex((prev) => (prev + 1) % feedTracks.length);
  }, [feedTracks.length]);

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

    if (clientX && clientY) {
      setHeartCoords({ x: clientX, y: clientY });
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);

    if (activeTrack && !likedIds.includes(activeTrack.id)) {
      onToggleLike(activeTrack.id);
      showToast(`❤️ Added "${activeTrack.title}" to Liked Songs`);
    }

    try {
      confetti({
        particleCount: 25,
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
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Background Dynamic Ambient Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${activeTrack?.coverUrl})` }}
      />

      {/* Top Header Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-2xl bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/10 transition-colors flex items-center gap-1.5"
            title="Back to REXT (ESC)"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">Close</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            <Flame className="w-4 h-4 text-[var(--accent-orange)] animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase">REXT Vibes</span>
            <span className="text-[10px] text-white/60 font-mono">Shorts Feed</span>
          </div>
        </div>

        {/* 3-Way Visual Mode Switcher (Video vs Canvas vs Lyrics) */}
        <div className="flex items-center gap-1 p-1 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10">
          <button
            onClick={() => setVisualMode('video')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              visualMode === 'video'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clip</span>
          </button>

          <button
            onClick={() => setVisualMode('canvas')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              visualMode === 'canvas'
                ? 'bg-[var(--accent-blue)] text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Canvas</span>
          </button>

          <button
            onClick={() => setVisualMode('lyrics')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              visualMode === 'lyrics'
                ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lyrics</span>
          </button>
        </div>
      </div>

      {/* Main Reel Card Container (Centered 9:16 vertical smartphone aspect ratio) */}
      <div className="relative w-full h-full max-w-[440px] max-h-[92vh] sm:rounded-3xl overflow-hidden bg-neutral-950 shadow-2xl border-0 sm:border border-white/10 flex flex-col justify-between my-auto">
        {/* Layer 1: Center-Cropped YouTube Video Anchor (9:16 Ratio) */}
        <div
          ref={videoAnchorRef}
          id="rext-vibes-video-anchor"
          className={`absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-500 bg-black ${
            visualMode === 'video' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-md scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${activeTrack?.coverUrl})` }}
          />
        </div>

        {/* Layer 2: Spotify-Style Aesthetic Looping Video Canvas */}
        {visualMode === 'canvas' && (
          <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
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

        {/* Layer 3: Kinetic Synced Typography Center Stage (Active on all modes, prominent on 'lyrics') */}
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
            <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl mb-4 animate-scale-up">
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </div>
          )}

          {/* Dynamic Lyric Word Bounce */}
          <div className="max-w-xs space-y-3 px-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] uppercase font-bold tracking-widest text-[var(--accent-orange)]">
              ⚡ Chorus Hook Drop
            </span>
            <p
              className={`font-extrabold leading-snug transition-all duration-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${
                visualMode === 'lyrics'
                  ? 'text-2xl sm:text-3xl text-white scale-105 filter drop-shadow-[0_0_15px_var(--accent-orange)]'
                  : 'text-xl sm:text-2xl text-white/95'
              }`}
            >
              {activeLyric || activeTrack.title}
            </p>
            <p className="text-xs text-white/70 font-medium">
              {activeTrack.artist}
            </p>
          </div>
        </div>

        {/* Top Gradient Shadow */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-25" />

        {/* Bottom Information & Controls Bar */}
        <div className="relative z-30 flex items-end justify-between p-4 sm:p-5 pb-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none">
          {/* Left: Song Meta & "Play Full Song" Button */}
          <div className="flex-1 pr-3 space-y-2 pointer-events-auto">
            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[var(--accent-orange)]">
                {activeTrack.genre}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/80">
                Studio HD
              </span>
              {bassBoost > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-[var(--accent-orange)] text-white text-[10px] font-mono font-bold">
                  +{bassBoost}dB Bass
                </span>
              )}
            </div>

            {/* Title & Artist */}
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white truncate drop-shadow">
                {activeTrack.title}
              </h3>
              <p className="text-xs text-white/80 truncate font-medium">
                {activeTrack.artist}
              </p>
            </div>

            {/* BIG ACTION: "Play Full Song" in Main Player */}
            <button
              onClick={() => onPlayFullSong(activeTrack, hookStartTime)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)] to-[#FF7A26] hover:scale-102 active:scale-98 text-white font-bold text-xs shadow-xl shadow-[var(--accent-glow)] transition-all group"
            >
              <Headphones className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Play Full Song</span>
            </button>
          </div>

          {/* Right Action Column (Instagram Reels Style) */}
          <div className="flex flex-col items-center gap-3.5 shrink-0 pointer-events-auto">
            {/* Like Button */}
            <button
              onClick={() => onToggleLike(activeTrack.id)}
              className="flex flex-col items-center gap-1 group"
              title={isLiked ? 'Liked' : 'Like'}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/15 transition-all ${
                  isLiked
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-105'
                    : 'bg-black/50 text-white hover:bg-black/70 group-hover:scale-105'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-bold text-white/80">
                {isLiked ? 'Liked' : 'Like'}
              </span>
            </button>

            {/* Bass Boost Toggle Switch */}
            <button
              onClick={cycleBass}
              className="flex flex-col items-center gap-1 group"
              title="Toggle Sub-Bass"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/15 transition-all ${
                  bassBoost > 0
                    ? 'bg-[var(--accent-orange)] text-white shadow-lg shadow-orange-500/40 scale-105'
                    : 'bg-black/50 text-white hover:bg-black/70 group-hover:scale-105'
                }`}
              >
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white/80 font-mono">
                {bassBoost > 0 ? `+${bassBoost}dB` : 'Bass'}
              </span>
            </button>

            {/* Add to Playlist */}
            <button
              onClick={() => onAddToPlaylist(activeTrack)}
              className="flex flex-col items-center gap-1 group"
              title="Add to Playlist"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/15 group-hover:scale-105 transition-all">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white/80">Add</span>
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
              className="flex flex-col items-center gap-1 group"
              title="Share Track"
            >
              <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/15 group-hover:scale-105 transition-all">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white/80">Share</span>
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
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-110 active:scale-95 shadow-xl"
          title="Previous Reel (Arrow Up)"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-110 active:scale-95 shadow-xl"
          title="Next Reel (Arrow Down)"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

