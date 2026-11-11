import React, { useState, useRef } from 'react';
import { Track } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Download,
  Check,
  Maximize2,
  Mic2,
  Sliders,
  Flame,
  ListMusic,
  Moon,
  Film
} from 'lucide-react';

interface PlayerBarProps {
  currentTrack: Track | null;
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
  isShuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  onCycleRepeat: () => void;
  bassBoost: number;
  onBassChange: (db: number) => void;
  isLiked: boolean;
  onToggleLike: () => void;
  isDownloaded: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  onDownload: () => void;
  onOpenBassLab: () => void;
  onOpenLyrics: () => void;
  onOpenFullscreen: () => void;
  isVideoVisible?: boolean;
  onToggleVideo?: () => void;
  onOpenQueue?: () => void;
  queueCount?: number;
  onOpenSleepTimer?: () => void;
  sleepTimerEnd?: number | null;
  playbackSpeed?: number;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
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
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
  bassBoost,
  onBassChange,
  isLiked,
  onToggleLike,
  isDownloaded,
  isDownloading = false,
  downloadProgress = 0,
  onDownload,
  onOpenBassLab,
  onOpenLyrics,
  onOpenFullscreen,
  isVideoVisible = false,
  onToggleVideo,
  onOpenQueue,
  queueCount = 0,
  onOpenSleepTimer,
  sleepTimerEnd = null,
  playbackSpeed = 1.0,
}) => {
  const [showBassPopover, setShowBassPopover] = useState(false);

  // Desktop Drag Scrubbing State
  const [isDraggingDesktop, setIsDraggingDesktop] = useState(false);
  const [dragTimeDesktop, setDragTimeDesktop] = useState<number | null>(null);
  const desktopScrubberRef = useRef<HTMLDivElement | null>(null);

  // Mobile Drag Scrubbing State
  const [isDraggingMobile, setIsDraggingMobile] = useState(false);
  const [dragTimeMobile, setDragTimeMobile] = useState<number | null>(null);
  const mobileScrubberRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePointerDownDesktop = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingDesktop(true);
    if (desktopScrubberRef.current && duration > 0) {
      const rect = desktopScrubberRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setDragTimeDesktop(progress * duration);
    }
  };

  const handlePointerMoveDesktop = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDesktop || !desktopScrubberRef.current || duration <= 0) return;
    const rect = desktopScrubberRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDragTimeDesktop(progress * duration);
  };

  const handlePointerUpDesktop = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingDesktop) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDraggingDesktop(false);
      if (dragTimeDesktop !== null) {
        onSeek(dragTimeDesktop);
        setDragTimeDesktop(null);
      }
    }
  };

  const handlePointerDownMobile = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingMobile(true);
    if (mobileScrubberRef.current && duration > 0) {
      const rect = mobileScrubberRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setDragTimeMobile(progress * duration);
    }
  };

  const handlePointerMoveMobile = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingMobile || !mobileScrubberRef.current || duration <= 0) return;
    const rect = mobileScrubberRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDragTimeMobile(progress * duration);
  };

  const handlePointerUpMobile = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingMobile) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDraggingMobile(false);
      if (dragTimeMobile !== null) {
        onSeek(dragTimeMobile);
        setDragTimeMobile(null);
      }
    }
  };

  const displayTimeDesktop = isDraggingDesktop && dragTimeDesktop !== null ? dragTimeDesktop : currentTime;
  const displayPercentDesktop = duration ? Math.min(100, (displayTimeDesktop / duration) * 100) : 0;

  const displayTimeMobile = isDraggingMobile && dragTimeMobile !== null ? dragTimeMobile : currentTime;
  const displayPercentMobile = duration ? Math.min(100, (displayTimeMobile / duration) * 100) : 0;

  if (!currentTrack) {
    return null;
  }

  let remainingSleepMinutes: number | null = null;
  if (sleepTimerEnd && sleepTimerEnd > 0) {
    remainingSleepMinutes = Math.max(1, Math.ceil((sleepTimerEnd - Date.now()) / 60000));
  }

  return (
    <>
      {/* ======================================================== */}
      {/* 1. MOBILE MINI-PLAYER (< md screens, docked above nav) */}
      {/* ======================================================== */}
      <div
        className="md:hidden fixed left-2.5 right-2.5 z-40 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden transition-all duration-300"
        style={{ bottom: 'calc(62px + max(0.35rem, env(safe-area-inset-bottom, 0px)))' }}
      >
        {/* Interactive Audio Progress Bar on top of mini-player */}
        <div
          ref={mobileScrubberRef}
          onPointerDown={handlePointerDownMobile}
          onPointerMove={handlePointerMoveMobile}
          onPointerUp={handlePointerUpMobile}
          onPointerCancel={handlePointerUpMobile}
          className="w-full h-3 -mt-0.5 bg-black/10 dark:bg-white/10 relative cursor-pointer touch-none group select-none flex items-center"
        >
          <div
            className="h-1.5 group-hover:h-2 group-active:h-2 bg-[var(--accent-orange)] transition-all relative"
            style={{ width: `${displayPercentMobile}%` }}
          >
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md transition-opacity ${
                isDraggingMobile ? 'opacity-100 scale-125' : 'opacity-0'
              }`}
            />
          </div>

          {/* Floating Live Drag Badge on Mobile */}
          {isDraggingMobile && (
            <div
              className="absolute -top-7 px-2 py-0.5 rounded-full bg-[var(--accent-orange)] text-white text-[10px] font-mono font-bold shadow-lg pointer-events-none -translate-x-1/2"
              style={{ left: `${displayPercentMobile}%` }}
            >
              {formatTime(displayTimeMobile)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-3 py-2 gap-2">
          {/* Track Artwork & Info (Tap anywhere to open Fullscreen Player) */}
          <div
            onClick={onOpenFullscreen}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[var(--border-color)] shadow-xs">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
                }}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5 text-white/80" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-[var(--text-main)] truncate">
                {currentTrack.title}
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Quick Lyrics on Mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenLyrics();
              }}
              className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--accent-orange)] transition-colors"
              title="Lyrics"
              aria-label="Open Lyrics"
            >
              <Mic2 className="w-3.5 h-3.5" />
            </button>

            {/* Quick Queue on Mobile */}
            {onOpenQueue && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenQueue();
                }}
                className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors relative"
                title="Up Next Queue"
                aria-label="Open Queue"
              >
                <ListMusic className="w-3.5 h-3.5" />
                {queueCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-orange)]" />
                )}
              </button>
            )}

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className={`min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl transition-colors ${
                isLiked ? 'text-[var(--accent-orange)]' : 'text-[var(--text-muted)]'
              }`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="w-9 h-9 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform ml-0.5"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]"
              aria-label="Next track"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP PLAYER BAR (>= md screens, full 3 columns)    */}
      {/* ======================================================== */}
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-2xl border-t border-[var(--border-color)] px-4 md:px-6 py-2.5 flex-col gap-1.5 shadow-xl transition-colors duration-300">
        {/* Top Scrubber Line */}
        <div className="w-full flex items-center gap-3 text-xs font-mono text-[var(--text-muted)] select-none">
          <span className="w-9 text-right text-[var(--text-main)] font-semibold">{formatTime(displayTimeDesktop)}</span>
          <div
            ref={desktopScrubberRef}
            onPointerDown={handlePointerDownDesktop}
            onPointerMove={handlePointerMoveDesktop}
            onPointerUp={handlePointerUpDesktop}
            onPointerCancel={handlePointerUpDesktop}
            className="flex-1 h-2 hover:h-3 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer relative group transition-all touch-none py-0.5"
          >
            <div
              className="h-full bg-[var(--accent-orange)] rounded-full relative"
              style={{ width: `${displayPercentDesktop}%` }}
            >
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md transition-all ${
                  isDraggingDesktop ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
                }`}
              />

              {/* Floating Live Drag Tooltip on Desktop */}
              {isDraggingDesktop && (
                <div className="absolute -top-7 right-0 translate-x-1/2 px-2 py-0.5 rounded-md bg-[var(--accent-orange)] text-white text-[10px] font-mono font-bold shadow-lg pointer-events-none">
                  {formatTime(displayTimeDesktop)}
                </div>
              )}
            </div>
          </div>
          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>

        {/* Main Bar Items: 3 Columns */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Track Information & Action icons */}
          <div className="flex items-center gap-3 min-w-0 max-w-[32%] sm:max-w-[28%]">
            <div
              onClick={onOpenFullscreen}
              className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 cursor-pointer group shadow-sm border border-[var(--border-color)]"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <h4
                onClick={onOpenFullscreen}
                className="font-bold text-sm text-[var(--text-main)] truncate cursor-pointer hover:text-[var(--accent-orange)] transition-colors"
              >
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[var(--text-muted)] truncate">{currentTrack.artist}</p>
            </div>

            {/* Like and Download Buttons */}
            <div className="hidden sm:flex items-center gap-1 pl-1">
              <button
                onClick={onToggleLike}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLiked ? 'text-[var(--accent-orange)]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
                title={isLiked ? 'Liked' : 'Like'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={onDownload}
                disabled={isDownloading}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDownloaded
                    ? 'text-[var(--accent-blue)]'
                    : isDownloading
                    ? 'text-[var(--accent-orange)]'
                    : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
                title={
                  isDownloaded
                    ? 'Downloaded'
                    : isDownloading
                    ? `Downloading ${downloadProgress}%`
                    : 'Download MP3'
                }
              >
                {isDownloaded ? (
                  <Check className="w-4 h-4 text-[var(--accent-blue)]" />
                ) : isDownloading ? (
                  <span className="text-[9px] font-mono font-bold">{downloadProgress}%</span>
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                isShuffle ? 'text-[var(--accent-orange)]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrev}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Main Play / Pause Button */}
            <button
              onClick={onTogglePlay}
              className="w-11 h-11 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={onCycleRepeat}
              className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                repeatMode !== 'off' ? 'text-[var(--accent-orange)]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Right: Bass, Video, EQ, Lyrics, Queue, Sleep, Volume */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Direct Quick Bass Slider Popover */}
            <div className="relative">
              <button
                onClick={() => setShowBassPopover(!showBassPopover)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  bassBoost > 0
                    ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                    : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Bass Boost"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Bass</span>
                {bassBoost > 0 && <span className="font-mono text-[10px]">+{bassBoost}dB</span>}
              </button>

              {showBassPopover && (
                <div className="absolute bottom-12 right-0 w-56 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-3 z-50 animate-slide-up">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[var(--accent-orange)]" /> Bass Boost
                    </span>
                    <span className="font-mono font-bold text-[var(--accent-orange)]">+{bassBoost} dB</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="18"
                    step="1"
                    value={bassBoost}
                    onChange={(e) => onBassChange(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-full cursor-pointer accent-[var(--accent-orange)]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <button onClick={() => onBassChange(0)} className="hover:text-[var(--text-main)]">0dB</button>
                    <button onClick={() => onBassChange(6)} className="hover:text-[var(--text-main)]">+6dB</button>
                    <button onClick={() => onBassChange(12)} className="hover:text-[var(--text-main)]">+12dB</button>
                    <button onClick={() => onBassChange(18)} className="text-[var(--accent-orange)] font-bold">+18dB</button>
                  </div>
                  <button
                    onClick={() => {
                      setShowBassPopover(false);
                      onOpenBassLab();
                    }}
                    className="w-full text-center text-xs text-[var(--accent-blue)] font-semibold hover:underline pt-1"
                  >
                    Open Equalizer →
                  </button>
                </div>
              )}
            </div>

            {/* Video Mode Toggle Button */}
            {onToggleVideo && (
              <button
                onClick={onToggleVideo}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isVideoVisible
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm'
                    : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title={isVideoVisible ? 'Video Mode: ON (Click for Audio Only)' : 'Turn On Video Mode'}
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Video</span>
                {isVideoVisible && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            )}

            {/* Equalizer Button */}
            <button
              onClick={onOpenBassLab}
              className="p-2 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Equalizer"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Lyrics Button */}
            <button
              onClick={onOpenLyrics}
              className="p-2 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors hidden sm:block"
              title="Lyrics (Live Karaoke)"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            {/* Queue Button */}
            {onOpenQueue && (
              <button
                onClick={onOpenQueue}
                className="p-2 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors relative"
                title="Play Queue (Up Next)"
              >
                <ListMusic className="w-4 h-4" />
                {queueCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[var(--accent-orange)] text-white text-[9px] font-mono font-bold shadow-xs">
                    {queueCount}
                  </span>
                )}
              </button>
            )}

            {/* Sleep Timer / Speed Button */}
            {onOpenSleepTimer && (
              <button
                onClick={onOpenSleepTimer}
                className={`p-2 rounded-xl transition-colors relative ${
                  sleepTimerEnd !== null || playbackSpeed !== 1.0
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Sleep Timer & Speed"
              >
                <Moon className="w-4 h-4" />
                {remainingSleepMinutes !== null && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-indigo-500 text-white text-[8px] font-mono font-bold">
                    {remainingSleepMinutes}m
                  </span>
                )}
              </button>
            )}

            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2 pl-1">
              <button
                onClick={onToggleMute}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-500" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-18 h-1.5 bg-black/15 dark:bg-white/15 rounded-full cursor-pointer accent-[var(--accent-orange)]"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
