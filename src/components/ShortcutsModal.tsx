import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', desc: 'Play / Pause music' },
  { key: 'Arrow Left / Right', desc: 'Seek 5 seconds backward / forward' },
  { key: 'Arrow Up / Down', desc: 'Volume Up / Down' },
  { key: 'B', desc: 'Quick Bass Boost Jump (+12 dB)' },
  { key: 'L', desc: 'Open / Close Live Synchronized Lyrics' },
  { key: 'F', desc: 'Toggle Fullscreen Theater Mode' },
  { key: 'M', desc: 'Mute / Unmute audio' },
  { key: 'Ctrl + K  or  /', desc: 'Focus Global Music Search' },
  { key: 'Esc', desc: 'Close any active modal or theater mode' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] flex items-center justify-center border border-[var(--accent-orange)]/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Keyboard Shortcuts</h3>
              <p className="text-xs text-[var(--text-muted)]">Quick controls for playback and navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {SHORTCUTS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]"
            >
              <span className="text-xs text-[var(--text-main)]">{item.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--accent-orange)] shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-xs text-[var(--text-sub)]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--text-main)] font-mono">Esc</kbd> anytime to exit
        </div>
      </div>
    </div>
  );
};
