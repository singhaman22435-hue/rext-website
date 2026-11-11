import React from 'react';
import { Playlist, ThemeMode, FontStyle } from '../types';
import {
  X,
  Disc,
  Plus,
  Crown,
  Palette,
  Type,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface MobileLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currentFont: FontStyle;
  onFontChange: (font: FontStyle) => void;
  onOpenImport: () => void;
  isPro?: boolean;
  onOpenProModal?: () => void;
}

const THEMES: { id: ThemeMode; label: string; color: string }[] = [
  { id: 'warmer', label: 'Cashmere Light', color: '#F7F4EE' },
  { id: 'sunset', label: 'Sunset Warm', color: '#FDF6EE' },
  { id: 'cold', label: 'Cold Frost', color: '#F1F5F9' },
  { id: 'mocha', label: 'Velvet Mocha', color: '#1A1614' },
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
  selectedPlaylistId,
  onSelectPlaylist,
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
            if (onOpenProModal) onOpenProModal();
          }}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            isPro
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-gradient-to-r from-[var(--accent-orange)] to-amber-500 text-white shadow-md'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">
                {isPro ? 'Rext Pro Active' : 'Upgrade to Rext Pro'}
              </h4>
              <p className={`text-[11px] ${isPro ? 'text-[var(--text-muted)]' : 'text-white/80'}`}>
                {isPro ? 'Cryptographic Lifetime License Verified' : 'FLAC 24-bit • Bass Chamber • Offline Audio'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-75 shrink-0" />
        </div>

        {/* Featured Curated Playlists */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-[var(--accent-orange)]" /> Curated Playlists
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">{playlists.length} packs</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
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
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-color)] hover:border-[var(--accent-orange)] text-xs font-semibold text-[var(--text-main)] transition-colors"
          >
            <Plus className="w-4 h-4 text-[var(--accent-orange)]" />
            <span>Import YouTube URL or Audio File</span>
          </button>
        </div>

        {/* Theme & Tone Picker */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[var(--accent-blue)]" /> Background Theme
          </span>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((theme) => {
              const active = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? 'border-[var(--accent-orange)] bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] font-bold'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="truncate">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Style Picker */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)] flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-purple-500" /> Typography Font
          </span>
          <div className="flex flex-wrap gap-1.5">
            {FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => onFontChange(font.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs transition-colors font-${font.id} ${
                  currentFont === font.id
                    ? 'bg-[var(--accent-orange)] text-white border-transparent font-bold'
                    : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-main)]'
                }`}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
