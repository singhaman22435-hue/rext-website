import React, { useRef, useState, useEffect } from 'react';
import {
  Search,
  X,
  Sliders,
  HardDrive,
  Keyboard,
  Palette,
  Type,
  Sun,
  Snowflake,
  Coffee,
  Moon,
  ChevronDown,
  Crown,
  Download,
  Menu,
  Music2,
  Sparkles,
  Clock,
  TrendingUp,
  Trash2
} from 'lucide-react';
import { GENRES } from '../services/musicCatalog';
import { ThemeMode, FontStyle } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onSelectGenre: (genreId: string) => void;
  bassBoost: number;
  onOpenBassLab: () => void;
  downloadCount: number;
  onOpenDownloads: () => void;
  onOpenShortcuts: () => void;
  isSearchingOnline?: boolean;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currentFont: FontStyle;
  onFontChange: (font: FontStyle) => void;
  isPro?: boolean;
  onOpenProModal?: () => void;
  onOpenMobileDrawer?: () => void;
  searchHistory?: string[];
  onSelectSearchHistory?: (term: string) => void;
  onClearSearchHistory?: () => void;
}

const THEMES: { id: ThemeMode; label: string; icon: React.ReactNode; colorPill: string }[] = [
  { id: 'warmer', label: 'Cashmere Light', icon: <Coffee className="w-3.5 h-3.5" />, colorPill: '#F7F4EE' },
  { id: 'sunset', label: 'Sunset Warm', icon: <Sun className="w-3.5 h-3.5" />, colorPill: '#FDF6EE' },
  { id: 'cold', label: 'Cold Frost', icon: <Snowflake className="w-3.5 h-3.5" />, colorPill: '#F1F5F9' },
  { id: 'mocha', label: 'Velvet Mocha', icon: <Moon className="w-3.5 h-3.5" />, colorPill: '#1A1614' },
];

const FONTS: { id: FontStyle; label: string }[] = [
  { id: 'outfit', label: 'Outfit (Modern)' },
  { id: 'syne', label: 'Syne (Geometric)' },
  { id: 'space', label: 'Space Grotesk' },
  { id: 'cinzel', label: 'Cinzel (Serif)' },
  { id: 'jakarta', label: 'Plus Jakarta' },
];

const TRENDING_CHIPS = [
  { label: '🔥 Top 50 Global', query: 'Top 50 Global' },
  { label: '🇮🇳 Bollywood Hits', query: 'Bollywood Hits' },
  { label: '⚡ Punjabi Beats', query: 'Punjabi Pop' },
  { label: '🌌 Lofi Vibes', query: 'Lofi Chill' },
  { label: '🏎️ Phonk Drift', query: 'Phonk' },
  { label: '🌙 Arijit Singh', query: 'Arijit Singh' },
];

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onSelectGenre,
  bassBoost,
  onOpenBassLab,
  downloadCount,
  onOpenDownloads,
  onOpenShortcuts,
  isSearchingOnline,
  currentTheme,
  onThemeChange,
  currentFont,
  onFontChange,
  isPro = false,
  onOpenProModal,
  onOpenMobileDrawer,
  searchHistory = [],
  onSelectSearchHistory,
  onClearSearchHistory,
}) => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];
  const activeFontObj = FONTS.find((f) => f.id === currentFont) || FONTS[0];

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-card)]/80 backdrop-blur-2xl border-b border-[var(--border-color)] px-3 sm:px-6 py-2.5 sm:py-3 space-y-2.5 transition-colors duration-300">
      {/* Top Mobile Brand Bar */}
      <div className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-blue)] flex items-center justify-center font-black text-white text-xs shadow-md">
            R
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-[var(--text-main)] flex items-center gap-1">
              rext <span className="text-[10px] text-[var(--accent-orange)] font-mono font-bold">PRO</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenBassLab}
            className="flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-main)] shadow-xs"
            aria-label="Equalizer"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span className="font-mono text-[11px] font-bold text-[var(--accent-orange)]">
              +{bassBoost}dB
            </span>
          </button>

          {onOpenProModal && (
            <button
              onClick={onOpenProModal}
              className={`min-h-[36px] px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 shadow-xs ${
                isPro
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-gradient-to-r from-[var(--accent-orange)] to-amber-500 text-white border-transparent'
              }`}
              aria-label="Pro Membership"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>{isPro ? 'Pro' : 'Get Pro'}</span>
            </button>
          )}

          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] shadow-xs"
              aria-label="Open Menu & Library"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Search & Desktop Controls Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Search Bar Container */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search any song, artist, YouTube stream..."
              className="w-full pl-10 pr-20 py-2 sm:py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-main)] placeholder-[var(--text-sub)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)] transition-all shadow-xs"
            />
            {/* Clear Button / Shortcut badge */}
            <div className="absolute right-3 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-muted)]"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-muted)]">
                  Ctrl+K
                </kbd>
              )}
              {isSearchingOnline && (
                <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-ping" title="Searching online..." />
              )}
            </div>
          </div>

          {/* Search History & Trending Suggestions Floating Card */}
          {isSearchFocused && !searchQuery && (
            <div className="absolute left-0 right-0 top-12 p-3 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl z-50 space-y-3 animate-slide-up">
              {/* Recent Searches */}
              {searchHistory.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] px-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </span>
                    {onClearSearchHistory && (
                      <button
                        onClick={onClearSearchHistory}
                        className="text-red-400 hover:underline flex items-center gap-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          onSelectSearchHistory?.(item);
                          setIsSearchFocused(false);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--accent-orange)]/15 hover:text-[var(--accent-orange)] text-xs text-[var(--text-main)] transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Quick Searches */}
              <div className="space-y-1.5 pt-1 border-t border-[var(--border-color)]/60">
                <span className="text-[11px] font-bold text-[var(--text-muted)] px-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[var(--accent-orange)]" /> Trending Discovery
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => {
                        onSelectSearchHistory?.(chip.query);
                        setIsSearchFocused(false);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[var(--accent-orange)] hover:text-white text-xs font-medium text-[var(--text-main)] transition-all"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Controls (Hidden on mobile to keep search bar wide) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowFontMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-orange)] text-xs font-semibold text-[var(--text-main)] transition-colors shadow-xs"
              title="Change Background Tone"
            >
              <span
                className="w-3 h-3 rounded-full border border-black/15 dark:border-white/20 shrink-0"
                style={{ backgroundColor: activeThemeObj.colorPill }}
              />
              <span>{activeThemeObj.label.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 top-11 w-52 p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl z-50 space-y-1 animate-slide-up">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">
                  Background Tone
                </div>
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onThemeChange(theme.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      currentTheme === theme.id
                        ? 'bg-[var(--accent-orange)] text-white font-bold'
                        : 'text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20"
                        style={{ backgroundColor: theme.colorPill }}
                      />
                      <span>{theme.label}</span>
                    </div>
                    {theme.icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFontMenu(!showFontMenu);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-blue)] text-xs font-semibold text-[var(--text-main)] transition-colors shadow-xs"
              title="Change System Typography"
            >
              <Type className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
              <span>{activeFontObj.label.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>

            {showFontMenu && (
              <div className="absolute right-0 top-11 w-48 p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl z-50 space-y-1 animate-slide-up">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-sub)]">
                  Typography Style
                </div>
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => {
                      onFontChange(font.id);
                      setShowFontMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      currentFont === font.id
                        ? 'bg-[var(--accent-blue)] text-white font-bold'
                        : 'text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pro Membership Pill */}
          {onOpenProModal && (
            <button
              onClick={onOpenProModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                isPro
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-gradient-to-r from-[var(--accent-orange)] to-amber-500 text-white border-transparent hover:opacity-95'
              }`}
              title="Rext Pro Membership"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>{isPro ? 'Pro Active' : 'Get Pro'}</span>
            </button>
          )}

          {/* Equalizer & Bass Shortcut Button */}
          <button
            onClick={onOpenBassLab}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-orange)] text-xs font-semibold text-[var(--text-main)] shadow-xs transition-colors"
            title="Audio Equalizer & Bass"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>Equalizer</span>
            {bassBoost > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-[var(--accent-orange)] text-white font-mono text-[10px] font-bold">
                +{bassBoost}dB
              </span>
            )}
          </button>

          {/* Downloads Vault Button */}
          <button
            onClick={onOpenDownloads}
            className="relative p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-blue)] text-[var(--text-main)] shadow-xs transition-colors"
            title="Downloads"
          >
            <HardDrive className="w-4 h-4 text-[var(--accent-blue)]" />
            {downloadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-blue)] text-white text-[10px] font-bold flex items-center justify-center">
                {downloadCount}
              </span>
            )}
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--border-color)]/80 text-[var(--text-muted)] hover:text-[var(--text-main)] shadow-xs transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar -mx-3 sm:mx-0 px-3 sm:px-0">
        {GENRES.map((genre) => {
          const isActive = selectedGenre === genre.id;
          return (
            <button
              key={genre.id}
              onClick={() => onSelectGenre(genre.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 min-h-[34px] flex items-center ${
                isActive
                  ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              {genre.name}
            </button>
          );
        })}
      </div>
    </header>
  );
};
