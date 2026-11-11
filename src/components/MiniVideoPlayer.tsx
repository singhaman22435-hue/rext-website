import React, { useRef, useEffect, useState } from 'react';
import { Track } from '../types';
import { youtubeEngine } from '../services/youtubeEngine';
import { Maximize2, X, Play, Pause, Film } from 'lucide-react';

interface MiniVideoPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenFullscreen: () => void;
  onCloseVideo: () => void;
  isVisible: boolean;
}

export const MiniVideoPlayer: React.FC<MiniVideoPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onOpenFullscreen,
  onCloseVideo,
  isVisible,
}) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isVisible && anchorRef.current) {
      youtubeEngine.setAnchor(anchorRef.current, 'mini-video', false);
    }
    return () => {
      // Clear anchor when unmounted or hidden
      youtubeEngine.clearAnchor('mini-video');
    };
  }, [isVisible, currentTrack?.id]);

  if (!isVisible || !currentTrack) return null;

  return (
    <div
      className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-40 w-64 sm:w-80 aspect-video rounded-2xl overflow-hidden border-2 border-[var(--border-color)] bg-black shadow-2xl shadow-black/60 group animate-slide-up select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      {/* Anchor Element where YouTube iframe is seamlessly positioned */}
      <div
        ref={anchorRef}
        id="rext-mini-video-anchor"
        className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden pointer-events-none bg-neutral-900"
      />

      {/* REXT Native Glass Overlay - captures all user interactions */}
      <div
        onClick={onTogglePlay}
        className={`absolute inset-0 z-55 flex flex-col justify-between p-2.5 bg-gradient-to-t from-black/80 via-transparent to-black/60 transition-opacity duration-300 cursor-pointer ${
          isHovered || !isPlaying ? 'opacity-100' : 'opacity-0 md:opacity-0 hover:opacity-100'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>REXT Cinema</span>
            <span className="text-[8px] font-mono opacity-60">1080p</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenFullscreen}
              className="p-1 rounded-lg bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-colors"
              title="Expand to Fullscreen Theater (F)"
              aria-label="Expand Video"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onCloseVideo}
              className="p-1 rounded-lg bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-colors"
              title="Switch to Audio Only"
              aria-label="Close Video"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Quick Play/Pause Badge */}
        <div className="flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-orange)]/90 backdrop-blur-sm text-white flex items-center justify-center shadow-lg transform active:scale-90 transition-transform">
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Bottom Title Info */}
        <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold truncate drop-shadow">{currentTrack.title}</p>
            <p className="text-[10px] text-white/70 truncate">{currentTrack.artist}</p>
          </div>
          <button
            onClick={onOpenFullscreen}
            className="shrink-0 p-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1"
          >
            <Film className="w-3 h-3 text-[var(--accent-orange)]" />
            <span className="hidden sm:inline">Theater</span>
          </button>
        </div>
      </div>
    </div>
  );
};

