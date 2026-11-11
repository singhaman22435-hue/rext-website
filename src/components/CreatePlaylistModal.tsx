import React, { useState, useEffect } from 'react';
import { FolderPlus, X, Sparkles } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)] to-[#FF7A26] text-white flex items-center justify-center shadow-md">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="create-playlist-title" className="text-lg font-bold text-[var(--text-main)]">
                New Playlist
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Create a personal collection of tracks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-main)]">Playlist Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Late Night Vibes, Gym Motivation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-main)]">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Tell what kind of tracks are in this playlist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-semibold text-[var(--text-muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl bg-[var(--accent-orange)] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--accent-glow)] disabled:opacity-50"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

