import React from 'react';
import { Playlist, ThemeMode, FontStyle } from '../types';
import {
  X,
  Disc,
  Palette,
  Type,
  FileAudio,
  Crown,
  ChevronRight,
  Sun,
  Snowflake,
  Coffee,
  Moon,
  Sparkles,
  Plus,
  FolderPlus
} from 'lucide-react';

interface MobileLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  userPlaylists?: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenCreatePlaylist?: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currentFont: FontStyle;
  onFontChange: (font: FontStyle) => void;
  onOpenImport: () => void;
  isPro?: boolean;
  onOpenProModal?: () => void;
}

const THEMES: { id: ThemeMode; label: string; icon: React.ReactNode; colorPill: string }[] = [
  { id: 'warmer', label: 'Cashmere Light', icon: <Coffee className="w-3.5 h-3.5" />, colorPill: '#F7F4EE' },
  { id: 'sunset', label: 'Sunset Warm', icon: <Sun className="w-3.5 h-3.5" />, colorPill: '#FDF6EE' },
  { id: 'cold', label: 'Cold Frost', icon: <Snowflake className="w-3.5 h-3.5" />, colorPill: '#F1F5F9' },
  { id: 'mocha', label: 'Velvet Mocha', icon: <Moon className="w-3.5 h-3.5" />, colorPill: '#1A1614' },
];

const FONTS: { id: FontStyle; label: string }[] = [
  { id: 'outfit', label: 'Outfit' },
  { id: 'syne', label: 'Syne' },
  { id: 'space', label: 'Space Grotesk' },
  { id: 'cinzel', label: 'Cinzel' },
  { id: 'jakarta', label: 'Jakarta' },
];

export const MobileLibraryDrawer: React.FC<MobileLibraryDrawerProps> = ({
  isOpen,
  onClose,
  playlists,
  userPlaylists = [],
  selectedPlaylistId,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  currentTheme,
  onThemeChange,
  currentFont,
  onFontChange,
  onOpenImport,
  isPro,
  onOpenProModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
      {/* Dim Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* Slide-Up Sheet */}
      <div
        className="relative z-10 w-full max-h-[85dvh] bg-[var(--bg-card)] rounded-t-3xl border-t border-[var(--border-color)] p-5 pb-8 overflow-y-auto space-y-6 shadow-2xl animate-slide-up transition-colors duration-300"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}
        role="dialog"
        aria-label="Library & Settings"
      >
        {/* Header Drag handle & Close */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-orange)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              r
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-main)]">Library & Settings</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Playlists, themes & audio import</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-muted)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pro Banner */}
        <div
          onClick={() => {
            onClose();
            onOpenProModal?.();
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent-orange)]/15 via-amber-500/15 to-[var(--accent-blue)]/15 border border-[var(--accent-orange)]/30 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[var(--accent-orange)] to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-[var(--text-main)]">
                {isPro ? 'Rext Pro Active' : 'Upgrade to Rext Pro'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {isPro ? 'VIP High-Res Master Audio' : 'Unlock 18dB Bass & Unlimited Storage'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[var(--accent-orange)]">
            {isPro ? 'Manage' : 'Upgrade →'}
          </span>
        </div>

        {/* Playlists Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-[var(--accent-orange)]" /> Playlists
            </span>
            {onOpenCreatePlaylist && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCreatePlaylist();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] text-xs font-bold"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* User Custom Playlists */}
            {userPlaylists.map((pl) => {
              const isSelected = selectedPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => {
                    onSelectPlaylist(pl);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-orange)]/10 border-[var(--accent-orange)] shadow-sm'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--border-color)] shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <h5
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-[var(--accent-orange)]' : 'text-[var(--text-main)]'
                      }`}
                    >
                      {pl.name}
                    </h5>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{pl.description}</p>
                    <span className="text-[9px] font-mono text-[var(--accent-orange)] font-semibold mt-0.5 inline-block">
                      {pl.trackIds.length} Songs (Custom)
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </button>
              );
            })}

            {/* Curated Playlists */}
            {playlists.map((pl) => {
              const isSelected = selectedPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => {
                    onSelectPlaylist(pl);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-orange)]/10 border-[var(--accent-orange)] shadow-sm'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--border-color)] shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <h5
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-[var(--accent-orange)]' : 'text-[var(--text-main)]'
                      }`}
                    >
                      {pl.name}
                    </h5>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{pl.description}</p>
                    <span className="text-[9px] font-mono text-[var(--accent-orange)] font-semibold mt-0.5 inline-block">
                      {pl.trackIds.length} Songs
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions: Import Custom Song */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">
            Custom Audio
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenImport();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-main)] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileAudio className="w-4 h-4 text-[var(--accent-blue)]" />
              <span>Import Audio (.mp3, .flac, .wav)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Theme Settings */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[var(--accent-blue)]" /> Theme Tone
          </span>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--accent-orange)] text-white font-bold border-transparent shadow-xs'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-main)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20 shrink-0"
                      style={{ backgroundColor: theme.colorPill }}
                    />
                    <span className="truncate">{theme.label}</span>
                  </div>
                  {theme.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Typography */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-[var(--accent-orange)]" /> Typography
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {FONTS.map((font) => {
              const isActive = currentFont === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() => onFontChange(font.id)}
                  className={`py-2 px-1.5 rounded-xl border text-xs text-center transition-all ${
                    isActive
                      ? 'bg-[var(--accent-blue)] text-white font-bold border-transparent shadow-xs'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-main)]'
                  }`}
                >
                  {font.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
