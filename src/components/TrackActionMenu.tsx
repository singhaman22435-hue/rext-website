import React, { useEffect, useRef } from 'react';
import { Track } from '../types';
import {
  ListPlus,
  ListVideo,
  FolderPlus,
  Share2,
  Mic2,
  Download,
  Trash2,
  Heart,
  Music2
} from 'lucide-react';

interface TrackActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
  anchorRect: DOMRect | null;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onShare: (track: Track) => void;
  onViewLyrics: (track: Track) => void;
  isLiked: boolean;
  onToggleLike: (trackId: string) => void;
  isDownloaded: boolean;
  onToggleDownload: (track: Track) => void;
}

export const TrackActionMenu: React.FC<TrackActionMenuProps> = ({
  isOpen,
  onClose,
  track,
  anchorRect,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onShare,
  onViewLyrics,
  isLiked,
  onToggleLike,
  isDownloaded,
  onToggleDownload,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on click outside & ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) return null;

  // Viewport-aware positioning
  const menuWidth = 220;
  const menuHeight = 280;
  const padding = 12;

  let top = anchorRect.bottom + 6;
  let left = anchorRect.right - menuWidth;

  // Flip upward if close to bottom
  if (top + menuHeight > window.innerHeight - padding) {
    top = Math.max(padding, anchorRect.top - menuHeight - 6);
  }

  // Adjust if overflowing on the left
  if (left < padding) {
    left = padding;
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
      }}
      className="w-56 p-1.5 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl space-y-0.5 text-xs font-medium text-[var(--text-main)] animate-fade-in select-none"
    >
      {/* Header Info */}
      <div className="p-2 border-b border-[var(--border-color)] flex items-center gap-2">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-8 h-8 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200';
          }}
        />
        <div className="min-w-0">
          <p className="font-bold text-[11px] truncate">{track.title}</p>
          <p className="text-[10px] text-[var(--text-muted)] truncate">{track.artist}</p>
        </div>
      </div>

      {/* Menu Actions */}
      <button
        onClick={() => {
          onPlayNext(track);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
      >
        <ListPlus className="w-4 h-4 text-[var(--accent-orange)]" />
        <span>Play Next</span>
      </button>

      <button
        onClick={() => {
          onAddToQueue(track);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
      >
        <ListVideo className="w-4 h-4 text-[var(--accent-blue)]" />
        <span>Add to Queue</span>
      </button>

      <button
        onClick={() => {
          onAddToPlaylist(track);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
      >
        <FolderPlus className="w-4 h-4 text-purple-400" />
        <span>Add to Playlist...</span>
      </button>

      <button
        onClick={() => {
          onViewLyrics(track);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
      >
        <Mic2 className="w-4 h-4 text-emerald-400" />
        <span>View Live Lyrics</span>
      </button>

      <button
        onClick={() => {
          onShare(track);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
      >
        <Share2 className="w-4 h-4 text-sky-400" />
        <span>Share Song Link</span>
      </button>

      <button
        onClick={() => {
          onToggleLike(track.id);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
      >
        <Heart
          className={`w-4 h-4 ${
            isLiked ? 'fill-current text-[var(--accent-orange)]' : 'text-[var(--text-muted)]'
          }`}
        />
        <span>{isLiked ? 'Remove from Liked' : 'Save to Liked Songs'}</span>
      </button>

      <button
        onClick={() => {
          onToggleDownload(track);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left border-t border-[var(--border-color)]/60 pt-2"
      >
        {isDownloaded ? (
          <>
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="text-red-400">Delete Offline Cache</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-[var(--accent-blue)]" />
            <span>Download Offline</span>
          </>
        )}
      </button>
    </div>
  );
};

