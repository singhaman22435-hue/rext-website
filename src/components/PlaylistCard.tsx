import React from 'react';
import { Playlist } from '../types';
import { Play } from 'lucide-react';

interface PlaylistCardProps {
  playlist: Playlist;
  onSelect: () => void;
  onPlayDirect: () => void;
  isCurrent?: boolean;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onSelect,
  onPlayDirect,
  isCurrent,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative p-3.5 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md ${
        isCurrent
          ? 'bg-[var(--bg-surface)] border-[var(--accent-orange)] shadow-md shadow-[var(--accent-glow)]'
          : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:bg-[var(--bg-card-hover)] hover:-translate-y-1'
      }`}
    >
      {/* Cover Artwork */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 shadow-sm bg-black/10 dark:bg-white/5">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400';
          }}
        />

        {/* Floating Play Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayDirect();
          }}
          className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[#FF7A26] text-white flex items-center justify-center shadow-xl shadow-[var(--accent-glow)] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
          title={`Play ${playlist.name}`}
          aria-label={`Play ${playlist.name}`}
        >
          <Play className="w-4 h-4 fill-current translate-x-0.5" />
        </button>

        {/* Track count pill */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
          {playlist.trackIds.length} Tracks
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--accent-orange)] transition-colors truncate">
          {playlist.name}
        </h4>
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {playlist.description}
        </p>
      </div>
    </div>
  );
};
