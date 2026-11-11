import React, { useEffect } from 'react';
import { Track } from '../types';
import {
  ListMusic,
  X,
  Trash2,
  Play,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Music2
} from 'lucide-react';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  queue: Track[];
  onPlayQueueTrack: (index: number) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  onMoveQueueItem: (fromIndex: number, toIndex: number) => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  queue,
  onPlayQueueTrack,
  onRemoveFromQueue,
  onClearQueue,
  onMoveQueueItem,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="queue-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="relative w-full max-w-xl max-h-[85vh] rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] flex items-center justify-center border border-[var(--accent-orange)]/30">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h3 id="queue-modal-title" className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                Play Queue
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-mono font-bold">
                  {queue.length} Up Next
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Songs queued to play in sequence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-red-500/15 text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors"
                title="Clear all songs from queue"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              aria-label="Close Queue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Now Playing Card */}
          {currentTrack && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-orange)] flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" /> Now Playing
              </span>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--accent-orange)] shadow-md shadow-[var(--accent-glow)]">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-[var(--text-main)] truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] truncate">{currentTrack.artist}</p>
                </div>
                <div className="flex items-end gap-0.5 h-4 px-2">
                  <span className="w-1 h-3 bg-[var(--accent-orange)] rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-[var(--accent-blue)] rounded-full animate-pulse" />
                  <span className="w-1 h-2 bg-[var(--accent-orange)] rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Next In Queue
            </span>

            {queue.length > 0 ? (
              <div className="space-y-2">
                {queue.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:bg-[var(--bg-card-hover)] transition-all group"
                  >
                    <div
                      onClick={() => onPlayQueueTrack(idx)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="w-5 text-center text-xs font-mono text-[var(--text-muted)] font-semibold">
                        {idx + 1}
                      </span>
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200';
                        }}
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-xs text-[var(--text-main)] truncate group-hover:text-[var(--accent-orange)] transition-colors">
                          {track.title}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Move Up/Down, Remove */}
                    <div className="flex items-center gap-1 shrink-0">
                      {idx > 0 && (
                        <button
                          onClick={() => onMoveQueueItem(idx, idx - 1)}
                          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < queue.length - 1 && (
                        <button
                          onClick={() => onMoveQueueItem(idx, idx + 1)}
                          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveFromQueue(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-[var(--accent-orange)] mx-auto opacity-70" />
                <p className="text-sm font-bold text-[var(--text-main)]">Queue is empty</p>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                  Click the 3-dots menu on any track and select "Play Next" or "Add to Queue".
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <span>💡 Tap any queued track to jump directly to it</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-main)] font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
