import React, { useState } from 'react';
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
  Video,
  VideoOff
} from 'lucide-react';
import { YoutubeIcon } from './YoutubeIcon';

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
}) => {
  const [showBassPopover, setShowBassPopover] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  if (!currentTrack) {
    return null;
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
        {/* Slim Audio Progress Bar on top of mini-player */}
        <div className="w-full h-1 bg-black/10 dark:bg-white/10 relative">
          <div
            className="h-full bg-[var(--accent-orange)] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 gap-2.5">
          {/* Track Artwork & Info (Tap anywhere to open Fullscreen Player) */}
          <div
            onClick={onOpenFullscreen}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border-color)] shadow-xs">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5 text-white/80" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <h4 className="font-bold text-xs text-[var(--text-main)] truncate">
                  {currentTrack.title}
                </h4>
                {Boolean(currentTrack.youtubeId || currentTrack.source === 'youtube') && (
                  <span className="shrink-0 px-1 py-0.2 rounded bg-red-600/15 text-red-600 text-[8px] font-bold font-mono">
                    YT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-colors ${
                isLiked ? 'text-[var(--accent-orange)]' : 'text-[var(--text-muted)]'
              }`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="w-10 h-10 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
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
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP PLAYER BAR (>= md screens, full 3 columns)    */}
      {/* ======================================================== */}
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-2xl border-t border-[var(--border-color)] px-4 md:px-6 py-2.5 flex-col gap-1.5 shadow-xl transition-colors duration-300">
        {/* Top Scrubber Line */}
        <div className="w-full flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
          <span className="w-9 text-right text-[var(--text-main)] font-semibold">{formatTime(currentTime)}</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newTime = (clickX / rect.width) * duration;
              onSeek(newTime);
            }}
            className="flex-1 h-1.5 hover:h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer relative group transition-all"
          >
            <div
              className="h-full bg-[var(--accent-orange)] rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
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
              className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group shadow-sm border border-[var(--border-color)]"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <h4
                  onClick={onOpenFullscreen}
                  className="font-bold text-sm text-[var(--text-main)] truncate cursor-pointer hover:text-[var(--accent-orange)] transition-colors"
                >
                  {currentTrack.title}
                </h4>
                {Boolean(currentTrack.youtubeId || currentTrack.source === 'youtube') && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-red-600/15 text-red-600 text-[10px] font-bold tracking-wider flex items-center gap-1 font-mono">
                    <YoutubeIcon className="w-3 h-3 text-red-600" /> YT
                  </span>
                )}
              </div>
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

          {/* Right: Bass Slider Popover, Lyrics, Equalizer, Volume */}
          <div className="flex items-center gap-2 sm:gap-3">
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
                    className="w-full h-2 rounded-full cursor-pointer"
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

            {/* Watch Video Button (When track is from YouTube) */}
            {Boolean(currentTrack.youtubeId || currentTrack.source === 'youtube') && onToggleVideo && (
              <button
                onClick={onToggleVideo}
                className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isVideoVisible
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500/30'
                    : 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-red-500'
                }`}
                title={isVideoVisible ? 'Hide Video' : 'Watch Official Music Video'}
              >
                {isVideoVisible ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span className="hidden lg:inline text-[11px]">{isVideoVisible ? 'Hide' : 'Video'}</span>
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
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </button>

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
                className="w-20 h-1.5 bg-black/15 dark:bg-white/15 rounded-full cursor-pointer"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
