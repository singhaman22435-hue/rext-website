import React, { useState, useEffect, useRef } from 'react';
import { Track, LyricLine } from '../types';
import { VisualizerCanvas } from './VisualizerCanvas';
import { LyricsService, LyricsResult } from '../services/lyricsService';
import { youtubeEngine } from '../services/youtubeEngine';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Minimize2,
  Zap,
  Mic2,
  Heart,
  Activity,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Film,
  Disc
} from 'lucide-react';

interface FullscreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  bassBoost: number;
  onBassChange: (db: number) => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export const FullscreenPlayer: React.FC<FullscreenPlayerProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  bassBoost,
  onBassChange,
  isLiked,
  onToggleLike,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'visualizer' | 'lyrics'>('video');
  const [lyricsData, setLyricsData] = useState<LyricsResult | null>(null);
  const [lyricOffset, setLyricOffset] = useState<number>(0);
  const [seekNotice, setSeekNotice] = useState<string | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const videoAnchorRef = useRef<HTMLDivElement | null>(null);

  // Load user manual lyric offset for this track
  useEffect(() => {
    if (track) {
      setLyricOffset(LyricsService.getLyricOffset(track.id));
    }
  }, [track?.id]);

  const handleAdjustOffset = (delta: number) => {
    if (!track) return;
    const next = Math.round((lyricOffset + delta) * 10) / 10;
    setLyricOffset(next);
    LyricsService.setLyricOffset(track.id, next);
    triggerSeekNotice(`Sync: ${next > 0 ? `+${next}` : next}s`);
  };

  const handleResetOffset = () => {
    if (!track) return;
    setLyricOffset(0);
    LyricsService.setLyricOffset(track.id, 0);
    triggerSeekNotice('Sync: 0.0s');
  };

  // Synchronize anchor element with YouTube engine when in video mode
  useEffect(() => {
    if (isOpen && activeTab === 'video' && videoAnchorRef.current) {
      youtubeEngine.setAnchor(videoAnchorRef.current, 'fullscreen-player', false);
    } else if (!isOpen || activeTab !== 'video') {
      youtubeEngine.clearAnchor('fullscreen-player');
    }
    return () => {
      youtubeEngine.clearAnchor('fullscreen-player');
    };
  }, [isOpen, activeTab, track?.id]);

  // Load full lyrics whenever track changes or player opens
  useEffect(() => {
    if (isOpen && track) {
      LyricsService.getLyrics(track).then((res) => {
        setLyricsData(res);
      });
    }
  }, [isOpen, track?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const triggerSeekNotice = (text: string) => {
    setSeekNotice(text);
    setTimeout(() => setSeekNotice(null), 800);
  };

  const lyrics = lyricsData?.synced && lyricsData.synced.length > 0 ? lyricsData.synced : track?.lyrics || [];

  // Scrubber Dragging State
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const scrubberRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingScrubber(true);
    if (scrubberRef.current && duration > 0) {
      const rect = scrubberRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setDragTime(progress * duration);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingScrubber || !scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDragTime(progress * duration);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingScrubber) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDraggingScrubber(false);
      if (dragTime !== null) {
        onSeek(dragTime);
        setDragTime(null);
      }
    }
  };

  const adjustedCurrentTime = Math.max(0, currentTime + lyricOffset);
  let activeIndex = -1;
  let activeLyricText = '';
  for (let i = 0; i < lyrics.length; i++) {
    if (adjustedCurrentTime >= lyrics[i].time) {
      activeIndex = i;
      activeLyricText = lyrics[i].text;
    } else {
      break;
    }
  }

  // Smooth scroll active line in lyrics tab or video split view
  useEffect(() => {
    if ((activeTab === 'lyrics' || activeTab === 'video') && activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, activeTab]);

  if (!isOpen || !track) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const displayCurrentTime = isDraggingScrubber && dragTime !== null ? dragTime : currentTime;
  const displayProgressPercent = duration ? (displayCurrentTime / duration) * 100 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Now Playing: ${track.title}`}
      className="fixed inset-0 z-50 bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-hidden animate-fade-in select-none"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Background Ambient Glows */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 blur-3xl scale-150 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
      />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#FF5500]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-[#0066FF]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-main)] transition-colors flex items-center gap-1"
            title="Back (ESC)"
            aria-label="Back"
          >
            <ChevronDown className="w-5 h-5 text-[var(--accent-orange)]" />
            <span className="text-xs font-bold hidden sm:inline">Back</span>
          </button>
          <div>
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
              <span>Theater Studio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-mono text-[var(--accent-orange)]">1080p DSP</span>
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-main)] truncate max-w-[160px] sm:max-w-xs">
              {track.album || track.title}
            </p>
          </div>
        </div>

        {/* 3-Way Tab Switcher: Video vs Spectrum vs Synced Lyrics */}
        <div className="flex items-center gap-1 p-1 bg-black/10 dark:bg-white/10 rounded-2xl backdrop-blur-md border border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'visualizer'
                ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spectrum</span>
          </button>

          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lyrics'
                ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
            {lyrics.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 sm:p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-main)] transition-colors"
          title="Exit Theater Mode (ESC)"
          aria-label="Exit Fullscreen"
        >
          <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Center Stage: Video vs Rotating Vinyl + Spectrum / Lyrics */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-center max-w-6xl mx-auto w-full my-auto py-2">
        {/* Left Column: Video Stage OR Vinyl Disc */}
        {activeTab === 'video' ? (
          <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border-2 border-[var(--border-color)] shadow-2xl group">
              {/* Pulsing ambient backdrop */}
              <div
                className="absolute -inset-4 bg-cover bg-center blur-2xl opacity-40 pointer-events-none"
                style={{ backgroundImage: `url(${track.coverUrl})` }}
              />

              {/* Anchor Element where YouTube iframe is seamlessly positioned */}
              <div
                ref={videoAnchorRef}
                id="rext-theater-video-anchor"
                className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden pointer-events-none bg-neutral-950"
              />

              {/* Paused Poster Shield: 100% covers YouTube default red play button and channel name */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 z-[59] bg-cover bg-center opacity-60 blur-xs pointer-events-none scale-105 transition-opacity duration-300"
                  style={{ backgroundImage: `url(${track.coverUrl})` }}
                />
              )}

              {/* REXT Custom Interactive Glass Overlay (Captures clicks, zero YouTube branding) */}
              <div
                onClick={onTogglePlay}
                onDoubleClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  if (clickX < rect.width / 2) {
                    onSeek(Math.max(0, currentTime - 10));
                    triggerSeekNotice('-10s');
                  } else {
                    onSeek(Math.min(duration, currentTime + 10));
                    triggerSeekNotice('+10s');
                  }
                }}
                className={`absolute inset-0 z-[60] flex flex-col justify-between p-3.5 sm:p-5 transition-all duration-300 cursor-pointer ${
                  !isPlaying
                    ? 'opacity-100 bg-black/85 backdrop-blur-sm'
                    : 'opacity-0 hover:opacity-100 focus-within:opacity-100 bg-gradient-to-t from-black/80 via-transparent to-black/60'
                }`}
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>REXT Cinema Studio</span>
                    <span className="text-[10px] text-white/60 font-mono">1080p HD</span>
                  </div>

                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-mono">
                    Double-tap: ±10s
                  </span>
                </div>

                {/* Center Play/Pause & Double-tap Notice */}
                <div className="flex items-center justify-center pointer-events-none">
                  {seekNotice ? (
                    <div className="px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md text-[var(--accent-orange)] text-lg font-extrabold border border-[var(--accent-orange)]/40 shadow-xl">
                      {seekNotice}
                    </div>
                  ) : (
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-orange)]/90 backdrop-blur-md text-white flex items-center justify-center shadow-2xl transition-transform ${isPlaying ? 'scale-90 hover:scale-100' : 'scale-105'}`}>
                      {isPlaying ? (
                        <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
                      ) : (
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Subtitle / Info */}
                <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
                  <div className="min-w-0 pr-2">
                    <h3 className="text-sm sm:text-base font-bold truncate drop-shadow">{track.title}</h3>
                    <p className="text-[11px] sm:text-xs text-white/80 truncate">{track.artist}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('visualizer')}
                    className="shrink-0 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-semibold text-white transition-colors flex items-center gap-1"
                  >
                    <Disc className="w-3.5 h-3.5" />
                    <span>Vinyl</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Live Lyric Line under Video */}
            <div
              onClick={() => setActiveTab('lyrics')}
              className="mt-2.5 w-full py-2 px-3.5 rounded-2xl bg-[var(--bg-card)]/80 border border-[var(--border-color)] text-center cursor-pointer hover:border-[var(--accent-orange)]/50 transition-colors"
            >
              <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">
                {activeLyricText || 'REXT Cinema Studio • 24-bit Audio DSP Active'}
              </p>
            </div>
          </div>
        ) : (
          /* Left: Vinyl Disc Presentation */
          <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
            <div className="relative group">
              {/* Pulsing Bass Glow beneath the disc */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-blue)] blur-2xl opacity-30 transition-transform duration-300 pointer-events-none"
                style={{
                  transform: `scale(${1 + (bassBoost / 18) * 0.25})`,
                }}
              />

              {/* Vinyl record disc */}
              <div
                className={`relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full bg-black border-4 border-[var(--border-color)] shadow-2xl flex items-center justify-center transition-transform ${
                  isPlaying ? 'animate-spin-vinyl' : 'animate-spin-vinyl animate-spin-vinyl-paused'
                }`}
              >
                <div className="absolute inset-3 sm:inset-4 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-6 sm:inset-8 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-10 sm:inset-14 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-16 sm:inset-20 rounded-full border border-white/10 pointer-events-none" />

                {/* Album art center sticker */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-[#1C1612] shadow-inner">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
                    }}
                  />
                  <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-black border-2 border-white/30" />
                </div>
              </div>
            </div>

            {/* Quick Track Info Under Vinyl */}
            <div className="text-center space-y-1 max-w-sm px-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-main)] flex items-center justify-center gap-2 sm:gap-3">
                <span className="truncate">{track.title}</span>
                <button
                  onClick={onToggleLike}
                  className={`transition-colors shrink-0 ${
                    isLiked
                      ? 'text-[var(--accent-orange)]'
                      : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                  }`}
                  aria-label="Toggle Like"
                >
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </h2>
              <p className="text-sm sm:text-base text-[var(--accent-blue)] font-medium truncate">
                {track.artist}
              </p>
            </div>
          </div>
        )}

        {/* Right Stage: Visualizer vs Synced Lyrics (Also shown in split-mode with Video) */}
        {activeTab === 'visualizer' ? (
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 bg-[var(--bg-card)]/90 p-5 sm:p-7 rounded-3xl border border-[var(--border-color)] shadow-xl backdrop-blur-md">
            {/* Visualizer inside theater */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--text-main)]">
                  <Zap className="w-4 h-4 text-[var(--accent-orange)]" /> High-Res Audio Spectrum
                </span>
                <span className="font-mono text-[11px] text-[var(--accent-blue)]">
                  {track.bitrate}
                </span>
              </div>
              <VisualizerCanvas
                height={85}
                mode="bars"
                showControls={true}
                isPlaying={isPlaying}
                track={track}
                bassBoost={bassBoost}
                currentTime={currentTime}
              />
            </div>

            {/* Live Karaoke Highlight Box with Quick Sync Offset Adjusters */}
            <div className="py-4 px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col justify-center text-center space-y-2 shadow-inner group">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[var(--accent-orange)] px-1">
                <span className="flex items-center gap-1">
                  <Mic2 className="w-3 h-3" /> Live Lyric Sync
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('lyrics')}
                  className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] flex items-center transition-colors cursor-pointer"
                >
                  View Full <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              <div
                onClick={() => setActiveTab('lyrics')}
                className="cursor-pointer py-1"
              >
                <p className="text-lg sm:text-xl font-bold text-[var(--text-main)] group-hover:scale-102 transition-transform">
                  {activeLyricText || 'Enjoy the music flow...'}
                </p>
              </div>

              {/* Live Timing Nudge Controls */}
              <div className="flex items-center justify-center gap-2 pt-1 border-t border-[var(--border-color)]/50">
                <span className="text-[10px] text-[var(--text-muted)] font-mono">Sync:</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleAdjustOffset(-0.5); }}
                  className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-[var(--accent-orange)] hover:text-white text-[11px] font-bold font-mono transition-colors"
                  title="Lyrics 0.5s earlier"
                >
                  -0.5s
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleResetOffset(); }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-colors ${
                    lyricOffset !== 0
                      ? 'bg-[var(--accent-orange)] text-white font-bold'
                      : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)]'
                  }`}
                  title="Reset sync offset"
                >
                  {lyricOffset === 0 ? '0.0s' : `${lyricOffset > 0 ? '+' : ''}${lyricOffset.toFixed(1)}s`}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleAdjustOffset(0.5); }}
                  className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-[var(--accent-orange)] hover:text-white text-[11px] font-bold font-mono transition-colors"
                  title="Lyrics 0.5s later"
                >
                  +0.5s
                </button>
              </div>
            </div>

            {/* Interactive Bass Boost Slider in Theater */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[var(--accent-orange)]" /> Sub-Bass Impact
                </span>
                <span className="text-xs font-mono font-bold text-[var(--accent-orange)]">
                  +{bassBoost.toFixed(0)} dB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="18"
                step="0.5"
                value={bassBoost}
                onChange={(e) => onBassChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full cursor-pointer accent-[var(--accent-orange)]"
              />
            </div>
          </div>
        ) : (
          /* Live Synchronized Lyrics Stage (Split view with Video or standalone Lyrics view) */
          <div className="flex flex-col h-[340px] sm:h-[400px] bg-[var(--bg-card)]/90 rounded-3xl border border-[var(--border-color)] shadow-xl backdrop-blur-md overflow-hidden">
            {/* Header with Timing Sync Pill */}
            <div className="p-3 px-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)] text-xs">
              <span className="font-bold flex items-center gap-1.5 text-[var(--text-main)]">
                <Mic2 className="w-3.5 h-3.5 text-[var(--accent-orange)]" /> Synchronized Stream
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:inline">Sync:</span>
                <button
                  type="button"
                  onClick={() => handleAdjustOffset(-0.5)}
                  className="px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 hover:bg-[var(--accent-orange)] hover:text-white text-[10px] font-mono font-bold transition-colors"
                  title="Lyrics 0.5s earlier"
                >
                  -0.5s
                </button>
                <button
                  type="button"
                  onClick={handleResetOffset}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                    lyricOffset !== 0 ? 'bg-[var(--accent-orange)] text-white font-bold' : 'text-[var(--text-muted)]'
                  }`}
                  title="Reset to 0s"
                >
                  {lyricOffset === 0 ? '0.0s' : `${lyricOffset > 0 ? '+' : ''}${lyricOffset.toFixed(1)}s`}
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustOffset(0.5)}
                  className="px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 hover:bg-[var(--accent-orange)] hover:text-white text-[10px] font-mono font-bold transition-colors"
                  title="Lyrics 0.5s later"
                >
                  +0.5s
                </button>
              </div>
            </div>

            {/* Scrollable Lyrics Stream */}
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto px-4 py-8 space-y-5 text-center scroll-smooth bg-[var(--bg-surface)]/30"
            >
              {lyrics.length > 0 ? (
                lyrics.map((line, idx) => {
                  const isActive = idx === activeIndex;
                  const isPast = idx < activeIndex;

                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => onSeek(line.time)}
                      className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl block max-w-lg mx-auto ${
                        isActive
                          ? 'text-xl sm:text-2xl font-extrabold text-[var(--accent-orange)] scale-105 filter drop-shadow-[0_2px_8px_var(--accent-glow)]'
                          : isPast
                          ? 'text-sm sm:text-base font-medium text-[var(--text-muted)] opacity-50 hover:opacity-100 hover:text-[var(--text-main)]'
                          : 'text-sm sm:text-base font-medium text-[var(--text-sub)] opacity-80 hover:opacity-100 hover:text-[var(--text-main)]'
                      }`}
                    >
                      <p>{line.text}</p>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-[var(--accent-orange)] mx-auto animate-bounce" />
                  <p className="text-base font-bold text-[var(--text-main)]">
                    No Synced Lyrics Available
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Enjoy the smooth instrumental beats and sub-bass frequencies.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-3 sm:space-y-4">
        {/* Scrubber */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-[var(--text-muted)] select-none">
          <span>{formatTime(displayCurrentTime)}</span>
          <div
            ref={scrubberRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex-1 h-2.5 hover:h-3.5 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer relative group transition-all touch-none py-0.5"
          >
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-blue)] rounded-full relative"
              style={{ width: `${displayProgressPercent}%` }}
            >
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${
                  isDraggingScrubber ? 'scale-125' : 'scale-100 opacity-0 group-hover:opacity-100'
                }`}
              />

              {/* Floating Tooltip Pill */}
              {isDraggingScrubber && (
                <div className="absolute -top-7 right-0 translate-x-1/2 px-2.5 py-0.5 rounded-lg bg-[var(--accent-orange)] text-white text-[11px] font-mono font-bold shadow-xl pointer-events-none">
                  {formatTime(displayCurrentTime)}
                </div>
              )}
            </div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-orange)] font-mono font-bold">
              FLAC 24-bit
            </span>
            <span>48,000 Hz Studio</span>
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-4 sm:gap-6 mx-auto sm:mx-0">
            <button
              onClick={onPrev}
              className="p-2 sm:p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Previous Track"
              aria-label="Previous Track"
            >
              <SkipBack className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[#FF7A26] text-white flex items-center justify-center shadow-xl shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
              ) : (
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 sm:p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Next Track"
              aria-label="Next Track"
            >
              <SkipForward className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          {/* Right Volume */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onToggleMute}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-red-500" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-1.5 rounded-full cursor-pointer accent-[var(--accent-orange)]"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
