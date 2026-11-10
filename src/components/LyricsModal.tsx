import React, { useEffect, useRef } from 'react';
import { Track } from '../types';
import { X, Mic2, Copy, Check, Sparkles } from 'lucide-react';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  track,
  currentTime,
  onSeek,
}) => {
  const [copied, setCopied] = React.useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lyrics = track?.lyrics || [];
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  useEffect(() => {
    if (isOpen && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen || !track) return null;

  const handleCopy = () => {
    if (!lyrics.length) return;
    const text = lyrics.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
      {/* Background Album Art Blur */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center blur-3xl pointer-events-none scale-125"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-3xl h-[85vh] rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] relative z-10 bg-[var(--bg-card)]/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-14 h-14 rounded-2xl object-cover shadow-md border border-[var(--border-color)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[var(--text-main)] line-clamp-1">{track.title}</h3>
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border border-[var(--accent-orange)]/30 font-bold">
                  <Mic2 className="w-3 h-3" /> Live Sync
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lyrics Scrollable Body */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 py-12 space-y-7 text-center scroll-smooth bg-[var(--bg-surface)]/50"
        >
          {lyrics.length > 0 ? (
            lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`cursor-pointer transition-all duration-300 py-2 px-5 rounded-2xl inline-block max-w-xl mx-auto ${
                    isActive
                      ? 'scale-105 text-2xl md:text-3xl font-extrabold text-[var(--accent-orange)] bg-[var(--bg-card)] border border-[var(--accent-orange)] shadow-md shadow-[var(--accent-glow)]'
                      : isPast
                      ? 'text-lg md:text-xl font-medium text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      : 'text-lg md:text-xl font-medium text-[var(--text-sub)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <p>{line.text}</p>
                </div>
              );
            })
          ) : (
            <div className="py-24 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[var(--accent-orange)] mx-auto animate-bounce" />
              <p className="text-lg font-bold text-[var(--text-main)]">Instrumental Master Recording</p>
              <p className="text-xs text-[var(--text-muted)]">
                Enjoy the smooth acoustic frequencies & deep sub-bass warmth.
              </p>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="p-3 text-center border-t border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] text-[var(--text-muted)]">
          💡 Click any lyric line to jump directly to that beat
        </div>
      </div>
    </div>
  );
};
