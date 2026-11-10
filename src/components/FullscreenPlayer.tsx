import React from 'react';
import { Track } from '../types';
import { VisualizerCanvas } from './VisualizerCanvas';
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
  Heart
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
  if (!isOpen || !track) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const lyrics = track.lyrics || [];
  let activeLyric = '';
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeLyric = lyrics[i].text;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between p-6 md:p-12 overflow-hidden animate-fade-in select-none">
      {/* Background Ambient Glows */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 blur-3xl scale-150 pointer-events-none"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
      />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#FF5500]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-[#0066FF]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-blue)] flex items-center justify-center font-black text-white text-xs shadow-sm">
            R
          </div>
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-[var(--text-muted)]">
              Now Playing
            </h4>
            <p className="text-sm font-semibold text-[var(--text-main)]">{track.album}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-main)] transition-colors"
          title="Exit Fullscreen (ESC)"
        >
          <Minimize2 className="w-6 h-6" />
        </button>
      </div>

      {/* Center Stage: Rotating Vinyl + Spectrum Visualizer */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto w-full my-auto">
        {/* Left: Vinyl Disc Presentation */}
        <div className="flex flex-col items-center justify-center space-y-6">
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
              className={`relative w-64 h-64 md:w-88 md:h-88 rounded-full bg-black border-4 border-[var(--border-color)] shadow-2xl flex items-center justify-center transition-transform ${
                isPlaying ? 'animate-spin-vinyl' : 'animate-spin-vinyl animate-spin-vinyl-paused'
              }`}
            >
              <div className="absolute inset-4 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-8 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-14 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-20 rounded-full border border-white/10 pointer-events-none" />

              {/* Album art center sticker */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#1C1612] shadow-inner">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-black border-2 border-white/30" />
              </div>
            </div>
          </div>

          {/* Quick Track Info Under Vinyl */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] flex items-center justify-center gap-3">
              {track.title}
              <button
                onClick={onToggleLike}
                className={`transition-colors ${
                  isLiked ? 'text-[var(--accent-orange)]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </h2>
            <p className="text-base text-[var(--accent-blue)] font-medium">{track.artist}</p>
          </div>
        </div>

        {/* Right: Live Dynamic Waveform & Synchronized Karaoke Lyrics */}
        <div className="flex flex-col justify-center space-y-6 bg-[var(--bg-card)] p-6 md:p-8 rounded-3xl border border-[var(--border-color)] shadow-xl">
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
            <VisualizerCanvas height={90} mode="bars" showControls={true} isPlaying={isPlaying} />
          </div>

          {/* Live Karaoke Highlight */}
          <div className="py-6 px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] min-h-[140px] flex flex-col justify-center text-center space-y-2 shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-orange)] flex items-center justify-center gap-1.5">
              <Mic2 className="w-3 h-3" /> Live Lyric Sync
            </span>
            <p className="text-xl md:text-2xl font-bold text-[var(--text-main)]">
              {activeLyric || 'Enjoy the smooth music flow...'}
            </p>
          </div>

          {/* Interactive Bass Boost Slider in Theater */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
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
              className="w-full h-2 rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-4">
        {/* Scrubber */}
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
          <span>{formatTime(currentTime)}</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newTime = (clickX / rect.width) * duration;
              onSeek(newTime);
            }}
            className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
          >
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-blue)] rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <div className="flex items-center gap-6 mx-auto sm:mx-0">
            <button
              onClick={onPrev}
              className="p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <SkipBack className="w-7 h-7" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[#FF7A26] text-white flex items-center justify-center shadow-xl shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <SkipForward className="w-7 h-7" />
            </button>
          </div>

          {/* Right Volume */}
          <div className="hidden sm:flex items-center gap-3">
            <button onClick={onToggleMute} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
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
              className="w-24 h-1.5 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
