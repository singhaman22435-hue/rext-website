import React from 'react';
import { ViewType, Playlist } from '../types';
import {
  Home,
  Music,
  Heart,
  Sliders,
  HardDrive,
  Disc,
  Radio,
  Crown,
  Download,
  Plus,
  FolderPlus,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  playlists: Playlist[];
  userPlaylists?: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenCreatePlaylist?: () => void;
  bassBoost: number;
  likedCount: number;
  downloadCount: number;
  totalTracksCount: number;
  isPro?: boolean;
  onOpenProModal?: () => void;
  onOpenInstallModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  playlists,
  userPlaylists = [],
  selectedPlaylistId,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  bassBoost,
  likedCount,
  downloadCount,
  totalTracksCount,
  isPro = false,
  onOpenProModal,
  onOpenInstallModal,
}) => {
  return (
    <aside className="hidden md:flex w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex-col justify-between p-4 shrink-0 select-none transition-colors duration-300">
      {/* Top Branding & Nav */}
      <div className="space-y-6">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent-orange)] text-white flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
            r
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[var(--text-main)]">
              rext
            </h1>
            <p className="text-[10px] font-medium text-[var(--text-muted)] tracking-wider">
              Music Stream
            </p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              currentView === 'home' && !selectedPlaylistId
                ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>

          <button
            onClick={() => onNavigate('youtube')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              currentView === 'youtube'
                ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-4 h-4 ${currentView === 'youtube' ? 'text-white' : 'text-[var(--accent-orange)]'}`} />
              Trending Charts
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              currentView === 'youtube' ? 'bg-white/20 text-white' : 'bg-[var(--accent-orange)]/15 text-[var(--accent-orange)]'
            }`}>
              HOT
            </span>
          </button>
        </nav>

        {/* Library Section */}
        <div className="space-y-1 pt-3 border-t border-[var(--border-color)]">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)]">
            Library
          </div>

          <button
            onClick={() => onNavigate('liked')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentView === 'liked'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-orange)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className={`w-4 h-4 ${likedCount > 0 ? 'text-[var(--accent-orange)] fill-current' : ''}`} />
              Liked Songs
            </div>
            {likedCount > 0 && (
              <span className="text-xs font-mono font-bold text-[var(--accent-orange)]">
                {likedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('downloads')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentView === 'downloads'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-blue)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <HardDrive className="w-4 h-4 text-[var(--accent-blue)]" />
              Downloads
            </div>
            {downloadCount > 0 && (
              <span className="text-xs font-mono font-bold text-[var(--accent-blue)]">
                {downloadCount}
              </span>
            )}
          </button>
        </div>

        {/* Playlists Section */}
        <div className="space-y-1 pt-3 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)]">
            <span>Playlists</span>
            {onOpenCreatePlaylist && (
              <button
                onClick={onOpenCreatePlaylist}
                className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[var(--accent-orange)] transition-colors"
                title="Create New Playlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {/* User Custom Playlists */}
            {userPlaylists.map((pl) => {
              const isSelected = selectedPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => onSelectPlaylist(pl)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium truncate transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-orange)] font-bold shadow-sm'
                      : 'text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <span className="truncate">{pl.name}</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {pl.trackIds.length}
                  </span>
                </button>
              );
            })}

            {/* Featured Playlists */}
            {playlists.map((pl) => {
              const isSelected = selectedPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => onSelectPlaylist(pl)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium truncate transition-colors ${
                    isSelected
                      ? 'bg-[var(--bg-surface)] text-[var(--accent-orange)] font-bold shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  {pl.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Pro Upsell & Install */}
      <div className="space-y-2 pt-2">
        {/* Pro Banner */}
        <div
          onClick={onOpenProModal}
          className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
            isPro
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-gradient-to-br from-amber-500/15 to-orange-500/15 border-amber-500/30 hover:border-amber-500'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
              <Crown className="w-3.5 h-3.5 fill-current" />
              {isPro ? 'rext Pro Active' : 'rext Pro Pass'}
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
              isPro ? 'bg-amber-500 text-white' : 'bg-[var(--accent-orange)] text-white'
            }`}>
              {isPro ? 'VIP' : 'PRO'}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
            {isPro ? '18dB Ultra Bass & Unlimited Vault' : 'Unlock 18dB Bass & Unlimited Downloads'}
          </p>
        </div>

        {/* Install Native App Button */}
        {onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[var(--text-main)] border border-[var(--border-color)] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>Install Rext App</span>
          </button>
        )}
      </div>
    </aside>
  );
};
