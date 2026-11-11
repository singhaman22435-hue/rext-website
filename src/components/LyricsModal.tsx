import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Track, LyricLine } from '../types';
import { LyricsService, LyricsResult } from '../services/lyricsService';
import {
  X,
  Mic2,
  Copy,
  Check,
  Sparkles,
  Search,
  Maximize2,
  Minimize2,
  Type,
  RefreshCw,
  Edit3,
  Volume2
} from 'lucide-react';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying?: boolean;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  track,
  currentTime,
  onSeek,
}) => {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lyricsData, setLyricsData] = useState<LyricsResult | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [isImmersive, setIsImmersive] = useState(false);
  const [viewMode, setViewMode] = useState<'synced' | 'plain'>('synced');
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [customText, setCustomText] = useState('');
  const [lyricOffset, setLyricOffset] = useState<number>(0);

  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userScrollTimeoutRef = useRef<number | null>(null);

  // Fetch lyrics when track changes or modal opens
  const loadLyrics = useCallback(async (currentTrack: Track) => {
    setIsLoading(true);
    setLyricOffset(LyricsService.getLyricOffset(currentTrack.id));
    try {
      const res = await LyricsService.getLyrics(currentTrack);
      setLyricsData(res);
    } catch (e) {
      console.error('Failed to load lyrics:', e);
      setLyricsData({ synced: currentTrack.lyrics || [], source: 'none' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && track) {
      loadLyrics(track);
      setShowSearch(false);
      setShowCustomEditor(false);
      setIsAutoScrollPaused(false);
    }
  }, [isOpen, track?.id, loadLyrics]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isImmersive) {
          setIsImmersive(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isImmersive, onClose]);

  // Determine active lyric index with user sync offset
  const lyrics = lyricsData?.synced || track?.lyrics || [];
  const adjustedCurrentTime = Math.max(0, currentTime + lyricOffset);
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (adjustedCurrentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth auto-scroll to active line
  useEffect(() => {
    if (
      isOpen &&
      !isAutoScrollPaused &&
      viewMode === 'synced' &&
      activeLineRef.current &&
      containerRef.current
    ) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen, isAutoScrollPaused, viewMode]);

  // User manual scroll detection
  const handleUserScroll = () => {
    setIsAutoScrollPaused(true);
    if (userScrollTimeoutRef.current) {
      window.clearTimeout(userScrollTimeoutRef.current);
    }
    // Auto-resume after 5 seconds of inactivity
    userScrollTimeoutRef.current = window.setTimeout(() => {
      setIsAutoScrollPaused(false);
    }, 5000);
  };

  const handleResumeAutoScroll = () => {
    setIsAutoScrollPaused(false);
    if (userScrollTimeoutRef.current) {
      window.clearTimeout(userScrollTimeoutRef.current);
    }
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  if (!isOpen || !track) return null;

  const handleCopy = () => {
    if (!lyrics.length && !lyricsData?.plain) return;
    const text = lyricsData?.plain || lyrics.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await LyricsService.searchLyrics(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectSearchResult = (result: any) => {
    let synced: LyricLine[] = [];
    if (result.syncedLyrics) {
      synced = LyricsService.parseLRC(result.syncedLyrics);
    } else if (result.plainLyrics) {
      synced = LyricsService.generatePacedLyrics(result.plainLyrics, track.duration || 180);
    }
    setLyricsData({
      synced,
      plain: result.plainLyrics,
      source: 'lrclib',
      isInstrumental: result.instrumental,
    });
    setShowSearch(false);
    setIsAutoScrollPaused(false);
  };

  const handleSaveCustom = () => {
    if (!customText.trim()) return;
    const saved = LyricsService.saveCustomLyrics(track.id, customText);
    setLyricsData(saved);
    setShowCustomEditor(false);
    setIsAutoScrollPaused(false);
  };

  const cycleFontSize = () => {
    const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];
    const nextIdx = (sizes.indexOf(fontSize) + 1) % sizes.length;
    setFontSize(sizes[nextIdx]);
  };

  const getFontSizeClasses = (isActive: boolean) => {
    switch (fontSize) {
      case 'sm':
        return isActive ? 'text-lg md:text-xl font-bold' : 'text-sm md:text-base font-normal';
      case 'md':
        return isActive ? 'text-xl md:text-2xl font-bold' : 'text-base md:text-lg font-medium';
      case 'xl':
        return isActive ? 'text-3xl md:text-4xl font-extrabold' : 'text-xl md:text-2xl font-semibold';
      case 'lg':
      default:
        return isActive ? 'text-2xl md:text-3xl font-extrabold' : 'text-lg md:text-xl font-medium';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lyrics-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-2xl animate-fade-in ${
        isImmersive ? 'p-0' : ''
      }`}
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Background Animated Album Art Blur */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center blur-3xl pointer-events-none scale-150 transition-all duration-700"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
      />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[var(--accent-orange)]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[var(--accent-blue)]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div
        className={`relative w-full ${
          isImmersive
            ? 'h-full max-w-none rounded-none'
            : 'max-w-4xl h-[90vh] rounded-3xl'
        } bg-[var(--bg-card)]/95 border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-300`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-color)] relative z-20 bg-[var(--bg-card)]/90 backdrop-blur-md">
          {/* Track Info */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shadow-md border border-[var(--border-color)] shrink-0"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="lyrics-modal-title"
                  className="text-base sm:text-lg font-bold text-[var(--text-main)] truncate"
                >
                  {track.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--accent-orange)]/30 font-bold shrink-0">
                  <Mic2 className="w-3 h-3" />
                  {lyricsData?.source === 'lrclib'
                    ? 'Synced LRCLIB'
                    : lyricsData?.source === 'curated'
                    ? 'Curated Sync'
                    : lyricsData?.source === 'custom'
                    ? 'Custom Sync'
                    : 'Acoustic'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">{track.artist}</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Search manual */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-xl transition-colors ${
                showSearch
                  ? 'bg-[var(--accent-orange)] text-white'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Search Different Lyrics"
              aria-label="Search Lyrics"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Custom Edit */}
            <button
              onClick={() => setShowCustomEditor(!showCustomEditor)}
              className={`p-2 rounded-xl transition-colors ${
                showCustomEditor
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Add Custom Lyrics"
              aria-label="Custom Lyrics"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Font Size */}
            <button
              onClick={cycleFontSize}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-mono font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title={`Current size: ${fontSize.toUpperCase()} - Click to change`}
              aria-label="Adjust font size"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="uppercase text-[11px]">{fontSize}</span>
            </button>

            {/* Plain / Synced Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'synced' ? 'plain' : 'synced')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Toggle View Mode"
            >
              {viewMode === 'synced' ? 'Plain' : 'Karaoke'}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Copy Lyrics"
              aria-label="Copy Lyrics"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            {/* Immersive Fullscreen Toggle */}
            <button
              onClick={() => setIsImmersive(!isImmersive)}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title={isImmersive ? 'Exit Fullscreen' : 'Enter Immersive Mode'}
              aria-label="Toggle Fullscreen Lyrics"
            >
              {isImmersive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Close (ESC)"
              aria-label="Close Lyrics Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Overlay Panel */}
        {showSearch && (
          <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-color)] animate-fade-in space-y-3 z-10">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Search song title or artist (e.g. Starboy The Weeknd)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 rounded-xl bg-[var(--accent-orange)] text-white text-sm font-bold hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 cursor-pointer text-left transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-[var(--text-main)]">{item.trackName}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.artistName} {item.albumName ? `• ${item.albumName}` : ''}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        item.syncedLyrics
                          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {item.syncedLyrics ? 'Synced LRC' : 'Plain'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custom Lyrics Editor Panel */}
        {showCustomEditor && (
          <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-color)] animate-fade-in space-y-3 z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-main)]">
                Paste Custom Lyrics (Supports LRC format [mm:ss.xx] or plain lines)
              </span>
              <button
                onClick={() => setShowCustomEditor(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                Cancel
              </button>
            </div>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="[00:15.50] Put your custom lyrics here..."
              className="w-full p-3 text-xs font-mono rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-blue)]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 rounded-xl bg-[var(--accent-blue)] text-white text-xs font-bold hover:brightness-110 transition-all"
              >
                Apply Custom Lyrics
              </button>
            </div>
          </div>
        )}

        {/* Lyrics Scrollable Body */}
        <div
          ref={containerRef}
          onWheel={handleUserScroll}
          onTouchMove={handleUserScroll}
          className={`flex-1 overflow-y-auto px-4 sm:px-8 py-10 sm:py-16 text-center scroll-smooth bg-[var(--bg-surface)]/40 relative select-none`}
        >
          {isLoading ? (
            <div className="py-24 text-center space-y-4 animate-pulse">
              <RefreshCw className="w-8 h-8 text-[var(--accent-orange)] mx-auto animate-spin" />
              <p className="text-base font-bold text-[var(--text-main)]">
                Fetching synchronized lyrics from LRCLIB...
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Matching acoustic timestamps with vocal frequencies
              </p>
            </div>
          ) : viewMode === 'plain' ? (
            <div className="max-w-2xl mx-auto text-left whitespace-pre-line text-base md:text-lg leading-relaxed text-[var(--text-main)] font-medium p-4">
              {lyricsData?.plain || lyrics.map((l) => l.text).join('\n')}
            </div>
          ) : lyrics.length > 0 ? (
            <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
              {lyrics.map((line, idx) => {
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;

                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => onSeek(line.time)}
                    className={`cursor-pointer transition-all duration-300 py-2.5 px-4 sm:px-6 rounded-2xl block mx-auto text-center transform ${
                      isActive
                        ? `${getFontSizeClasses(
                            true
                          )} text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-orange)] via-[#FFA726] to-[var(--accent-blue)] scale-105 font-extrabold shadow-sm filter drop-shadow-[0_2px_8px_var(--accent-glow)]`
                        : isPast
                        ? `${getFontSizeClasses(
                            false
                          )} text-[var(--text-muted)] opacity-60 hover:opacity-100 hover:text-[var(--text-main)]`
                        : `${getFontSizeClasses(
                            false
                          )} text-[var(--text-sub)] opacity-85 hover:opacity-100 hover:text-[var(--text-main)]`
                    }`}
                  >
                    <p className="tracking-tight leading-relaxed">{line.text}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-[var(--accent-orange)] mx-auto animate-bounce" />
              <p className="text-xl font-bold text-[var(--text-main)]">
                {lyricsData?.isInstrumental
                  ? 'Instrumental Recording'
                  : 'No Synced Lyrics Found'}
              </p>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                {lyricsData?.isInstrumental
                  ? 'This track is marked as an instrumental piece with no vocal lyrics.'
                  : 'Try searching manually using the search button above or paste custom lyrics.'}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowSearch(true)}
                  className="px-4 py-2 rounded-xl bg-[var(--accent-orange)] text-white text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search Lyrics
                </button>
                <button
                  onClick={() => loadLyrics(track)}
                  className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Fetch
                </button>
              </div>
            </div>
          )}

          {/* Floating Resume Auto-Scroll Button */}
          {isAutoScrollPaused && viewMode === 'synced' && lyrics.length > 0 && (
            <div className="sticky bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
              <button
                onClick={handleResumeAutoScroll}
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-orange)] text-white font-bold text-xs shadow-lg shadow-[var(--accent-glow)] animate-bounce hover:scale-105 active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Resume Auto-scroll
              </button>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="p-3 text-center border-t border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] text-[var(--text-muted)] flex items-center justify-between px-6">
          <span className="hidden sm:inline">💡 Tap any lyric line to jump directly to that beat</span>
          <span className="text-[10px] text-[var(--accent-orange)] font-mono">
            Powered by LRCLIB Open Sync
          </span>
          <button
            onClick={handleCopy}
            className="sm:hidden text-xs text-[var(--accent-orange)] font-bold"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
