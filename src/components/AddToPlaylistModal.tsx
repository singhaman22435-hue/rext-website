import React, { useEffect } from 'react';
import { Track, Playlist } from '../types';
import { FolderPlus, Check, Plus, X, Music2 } from 'lucide-react';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  userPlaylists: Playlist[];
  onToggleTrackInPlaylist: (playlistId: string, trackId: string) => void;
  onOpenCreatePlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  track,
  userPlaylists,
  onToggleTrackInPlaylist,
  onOpenCreatePlaylist,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !track) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-playlist-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div>
            <h3 id="add-to-playlist-title" className="text-base font-bold text-[var(--text-main)]">
              Add to Playlist
            </h3>
            <p className="text-xs text-[var(--text-muted)] truncate max-w-xs">
              "{track.title}" by {track.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist List */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {userPlaylists.length > 0 ? (
            userPlaylists.map((pl) => {
              const isIncluded = pl.trackIds.includes(track.id);

              return (
                <div
                  key={pl.id}
                  onClick={() => onToggleTrackInPlaylist(pl.id, track.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    isIncluded
                      ? 'bg-[var(--accent-orange)]/10 border-[var(--accent-orange)] text-[var(--text-main)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={pl.coverUrl}
                      alt={pl.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">{pl.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {pl.trackIds.length} tracks
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isIncluded
                        ? 'bg-[var(--accent-orange)] border-[var(--accent-orange)] text-white'
                        : 'border-[var(--border-color)]'
                    }`}
                  >
                    {isIncluded && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center space-y-2">
              <FolderPlus className="w-8 h-8 text-[var(--accent-orange)] mx-auto opacity-70" />
              <p className="text-xs font-bold text-[var(--text-main)]">
                You haven't created any custom playlists yet!
              </p>
            </div>
          )}
        </div>

        {/* Create Playlist Shortcut */}
        <button
          onClick={() => {
            onClose();
            onOpenCreatePlaylist();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-dashed border-[var(--accent-orange)]/50 text-[var(--accent-orange)] hover:bg-[var(--accent-orange)]/10 text-xs font-bold transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Playlist
        </button>
      </div>
    </div>
  );
};
