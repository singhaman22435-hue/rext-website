import React from 'react';
import { Track } from '../types';
import { Play, Pause, Heart, Download, Check, MoreVertical } from 'lucide-react';

interface TrackRowProps {
  index: number;
  track: Track;
  isPlaying: boolean;
  isCurrent: boolean;
  isLiked: boolean;
  isDownloaded: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  onPlay: () => void;
  onToggleLike: () => void;
  onDownload: () => void;
  onOpenBassLab?: () => void;
  onOpenMenu?: (track: Track, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  index,
  track,
  isPlaying,
  isCurrent,
  isLiked,
  isDownloaded,
  isDownloading = false,
  downloadProgress = 0,
  onPlay,
  onToggleLike,
  onDownload,
  onOpenMenu,
}) => {
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm ${
        isCurrent
          ? 'bg-[var(--bg-surface)] border-[var(--accent-orange)] shadow-sm'
          : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--accent-orange)]/40'
      }`}
      onClick={onPlay}
    >
      {/* Left: Index / Play Icon & Track Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Track Index or Playing Waveform */}
        <div className="w-6 text-center text-xs font-mono font-medium text-[var(--text-sub)] shrink-0 flex items-center justify-center">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-1 h-3 bg-[var(--accent-orange)] rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-[var(--accent-blue)] rounded-full animate-pulse" />
              <span className="w-1 h-2 bg-[var(--accent-orange)] rounded-full animate-pulse" />
            </div>
          ) : (
            <span className="group-hover:hidden">{index + 1}</span>
          )}
          <Play
            className={`w-4 h-4 text-[var(--text-main)] fill-current hidden ${
              !(isCurrent && isPlaying) ? 'group-hover:block' : ''
            }`}
          />
        </div>

        {/* Cover Art */}
        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[var(--border-color)] shadow-sm">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200';
            }}
          />
          {isCurrent && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white fill-current" />
              ) : (
                <Play className="w-4 h-4 text-white fill-current" />
              )}
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1 pr-2">
          <h4
            className={`font-semibold text-sm truncate ${
              isCurrent ? 'text-[var(--accent-orange)] font-bold' : 'text-[var(--text-main)] group-hover:text-[var(--accent-orange)]'
            }`}
          >
            {track.title}
          </h4>
          <p className="text-xs text-[var(--text-muted)] truncate">{track.artist}</p>
        </div>
      </div>

      {/* Right: Album / Genre, Duration & Actions */}
      <div
        className="flex items-center gap-2 sm:gap-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-[var(--text-muted)] hidden md:block max-w-[140px] truncate">
          {track.album || track.genre}
        </span>

        {/* Like Button */}
        <button
          onClick={onToggleLike}
          className={`p-2 rounded-xl transition-colors ${
            isLiked
              ? 'text-[var(--accent-orange)]'
              : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
          }`}
          title={isLiked ? 'Liked' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Download Button */}
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className={`p-2 rounded-xl transition-all relative ${
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
            <div className="w-4 h-4 flex items-center justify-center font-mono text-[9px] font-bold">
              {downloadProgress}%
            </div>
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>

        {/* Track Duration (Desktop/Tablet) */}
        <span className="text-xs font-mono text-[var(--text-sub)] w-10 text-right hidden sm:block">
          {formatDuration(track.duration)}
        </span>

        {/* More 3-Dots Menu Button */}
        {onOpenMenu && (
          <button
            onClick={(e) => onOpenMenu(track, e)}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
