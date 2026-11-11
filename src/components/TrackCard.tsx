import React from 'react';
import { Track } from '../types';
import { Play, Pause, Heart, Download, Check, MoreVertical } from 'lucide-react';

interface TrackCardProps {
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

export const TrackCard: React.FC<TrackCardProps> = ({
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
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={onPlay}
      className={`group relative p-3 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
        isCurrent
          ? 'bg-[var(--bg-surface)] border-[var(--accent-orange)] shadow-md'
          : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:bg-[var(--bg-card-hover)]'
      }`}
    >
      {/* Cover Image & Hover Play Button */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5 shadow-sm bg-[var(--bg-surface-hover)]">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
          }}
        />

        {/* Floating Play Button */}
        <div
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-md transition-all duration-200 ${
            isCurrent && isPlaying
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </div>

        {/* Quality Pill */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
            {track.bitrate}
          </span>
        </div>
      </div>

      {/* Info & Duration */}
      <div className="space-y-0.5 flex-1 min-w-0">
        <h4
          className={`font-semibold text-sm truncate transition-colors ${
            isCurrent ? 'text-[var(--accent-orange)] font-bold' : 'text-[var(--text-main)] group-hover:text-[var(--accent-orange)]'
          }`}
        >
          {track.title}
        </h4>
        <p className="text-xs text-[var(--text-muted)] truncate">{track.artist}</p>
      </div>

      {/* Action Row */}
      <div
        className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--border-color)] text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] font-mono text-[var(--text-sub)]">
          {formatDuration(track.duration)}
        </span>

        <div className="flex items-center gap-0.5">
          <button
            onClick={onToggleLike}
            className={`p-1.5 rounded-lg transition-colors ${
              isLiked ? 'text-[var(--accent-orange)]' : 'text-[var(--text-sub)] hover:text-[var(--text-main)]'
            }`}
            title="Like"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
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
            title={isDownloaded ? 'Downloaded' : 'Download MP3'}
          >
            {isDownloaded ? (
              <Check className="w-3.5 h-3.5" />
            ) : isDownloading ? (
              <span className="text-[9px] font-mono font-bold">{downloadProgress}%</span>
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>

          {onOpenMenu && (
            <button
              onClick={(e) => onOpenMenu(track, e)}
              className="p-1.5 rounded-lg text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
