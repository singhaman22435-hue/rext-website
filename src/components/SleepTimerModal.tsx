import React, { useEffect } from 'react';
import { Moon, Clock, Gauge, X, Check } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepTimerEnd: number | null; // timestamp in ms, or -1 for end of track
  onSetSleepTimer: (minutes: number | 'end-of-track' | null) => void;
  playbackSpeed: number;
  onSetPlaybackSpeed: (speed: number) => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  sleepTimerEnd,
  onSetSleepTimer,
  playbackSpeed,
  onSetPlaybackSpeed,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const timerOptions: Array<{ label: string; val: number | 'end-of-track' }> = [
    { label: '15 Minutes', val: 15 },
    { label: '30 Minutes', val: 30 },
    { label: '45 Minutes', val: 45 },
    { label: '60 Minutes', val: 60 },
    { label: 'End of current song', val: 'end-of-track' },
  ];

  const speedOptions = [0.75, 1.0, 1.25, 1.5];

  // Calculate remaining minutes if active
  let remainingMinutes: number | null = null;
  if (sleepTimerEnd && sleepTimerEnd > 0) {
    const diff = Math.max(0, sleepTimerEnd - Date.now());
    remainingMinutes = Math.ceil(diff / 60000);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sleep-timer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="sleep-timer-title" className="text-base font-bold text-[var(--text-main)]">
                Sleep & Playback Speed
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                {sleepTimerEnd === -1
                  ? 'Pausing at end of song'
                  : remainingMinutes !== null
                  ? `Pausing in ${remainingMinutes} min`
                  : 'Timer is off'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sleep Timer Section */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Sleep Timer
          </span>

          <div className="grid grid-cols-2 gap-2">
            {timerOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  onSetSleepTimer(opt.val);
                  onClose();
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  (opt.val === 'end-of-track' && sleepTimerEnd === -1) ||
                  (typeof opt.val === 'number' &&
                    sleepTimerEnd &&
                    sleepTimerEnd > 0 &&
                    Math.abs(sleepTimerEnd - (Date.now() + opt.val * 60000)) < 30000)
                    ? 'bg-indigo-600 text-white font-bold shadow-md'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {sleepTimerEnd !== null && (
            <button
              onClick={() => {
                onSetSleepTimer(null);
                onClose();
              }}
              className="w-full text-center py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              Cancel Sleep Timer
            </button>
          )}
        </div>

        {/* Playback Speed Section */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
          <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[var(--accent-orange)]" /> Playback Speed
          </span>

          <div className="grid grid-cols-4 gap-2">
            {speedOptions.map((spd) => (
              <button
                key={spd}
                onClick={() => onSetPlaybackSpeed(spd)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  playbackSpeed === spd
                    ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {spd === 1.0 ? '1.0x (Norm)' : `${spd}x`}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-center">
            💡 0.75x gives a slowed & reverb vibe; 1.25x gives a nightcore rush.
          </p>
        </div>
      </div>
    </div>
  );
};
