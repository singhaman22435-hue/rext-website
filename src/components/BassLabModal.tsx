import React, { useEffect } from 'react';
import { EQ_PRESETS } from '../services/audioEngine';
import { EqualizerBand, EqualizerPreset } from '../types';
import { VisualizerCanvas } from './VisualizerCanvas';
import {
  Sliders,
  RotateCcw,
  Activity,
  Flame,
  X,
  Sparkles,
  Headphones
} from 'lucide-react';

interface BassLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  bassBoost: number;
  onBassChange: (db: number) => void;
  trebleBoost: number;
  onTrebleChange: (db: number) => void;
  spatialAudio: boolean;
  onSpatialToggle: (enabled: boolean) => void;
  eqBands: EqualizerBand[];
  onEqBandChange: (index: number, gain: number) => void;
  activePresetId: string;
  onSelectPreset: (preset: EqualizerPreset) => void;
}

export const BassLabModal: React.FC<BassLabModalProps> = ({
  isOpen,
  onClose,
  bassBoost,
  onBassChange,
  trebleBoost,
  onTrebleChange,
  spatialAudio,
  onSpatialToggle,
  eqBands,
  onEqBandChange,
  activePresetId,
  onSelectPreset,
}) => {
  // ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    const flat = EQ_PRESETS.find((p) => p.id === 'flat')!;
    if (flat) onSelectPreset(flat);
    onTrebleChange(0);
    onSpatialToggle(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bass-lab-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-5 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="bass-lab-title" className="text-xl font-bold tracking-tight text-[var(--text-main)]">
                Equalizer & Bass Lab
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Tune bass boost, 5-band EQ frequencies, and 3D spatial sound
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface-hover)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Reset to flat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              aria-label="Close Equalizer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Spectrum Visualizer */}
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
              <Activity className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
              Audio Spectrum
            </span>
            <span className="font-mono text-xs text-[var(--accent-orange)] font-bold">
              Bass: +{bassBoost.toFixed(0)} dB
            </span>
          </div>
          <VisualizerCanvas height={70} mode="bars" showControls={false} />
        </div>

        {/* Bass Booster Control */}
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-[var(--accent-orange)] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Low-Shelf Filter
              </span>
              <h3 className="text-base font-bold text-[var(--text-main)]">
                Sub-Bass Impact
              </h3>
            </div>
            <span className="text-2xl font-black font-mono text-[var(--accent-orange)]">
              +{bassBoost.toFixed(0)} dB
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="18"
            step="1"
            value={bassBoost}
            onChange={(e) => onBassChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full cursor-pointer accent-[var(--accent-orange)]"
            aria-label="Bass Boost level in dB"
          />

          <div className="flex justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>0 dB (Flat)</span>
            <span>+6 dB</span>
            <span>+12 dB</span>
            <span className="text-[var(--accent-orange)] font-semibold">+18 dB</span>
          </div>

          {/* Quick Bass Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-color)]">
            {[
              { label: 'Flat (0 dB)', val: 0 },
              { label: 'Subtle (+4 dB)', val: 4 },
              { label: 'Punchy (+8 dB)', val: 8 },
              { label: 'Deep (+12 dB)', val: 12 },
              { label: 'Club (+16 dB)', val: 16 },
            ].map((pill) => (
              <button
                key={pill.val}
                onClick={() => onBassChange(pill.val)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                  bassBoost === pill.val
                    ? 'bg-[var(--accent-orange)] text-white font-bold shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Graphic Equalizer */}
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-5 space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--accent-blue)]" />
            5-Band Equalizer
          </h3>

          <div className="grid grid-cols-5 gap-3 pt-2">
            {eqBands.map((band, idx) => (
              <div key={band.freq} className="flex flex-col items-center space-y-2">
                <span className="text-xs font-mono font-semibold text-[var(--text-main)]">
                  {band.gain > 0 ? `+${band.gain}` : band.gain} dB
                </span>

                <div className="h-32 flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={band.gain}
                    onChange={(e) => onEqBandChange(idx, parseFloat(e.target.value))}
                    className="h-28 -rotate-90 cursor-pointer accent-[var(--accent-orange)]"
                    aria-label={`Equalizer band ${band.label}`}
                  />
                </div>

                <span className="text-[11px] font-mono font-medium text-[var(--text-muted)]">
                  {band.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Presets & Extras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* EQ Presets */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">
              Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {EQ_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`p-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                    activePresetId === preset.id
                      ? 'bg-[var(--accent-orange)] text-white font-bold shadow-sm'
                      : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <p className="font-semibold">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Treble & Spatial Audio */}
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">
              Audio Enhancements
            </span>

            {/* Treble Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--text-main)]">Treble Clarity</span>
                <span className="font-mono font-bold text-[var(--accent-blue)]">+{trebleBoost} dB</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={trebleBoost}
                onChange={(e) => onTrebleChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full cursor-pointer accent-[var(--accent-blue)]"
                aria-label="Treble boost in dB"
              />
            </div>

            {/* Spatial Audio Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[var(--accent-blue)]" />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-main)]">Spatial Audio</p>
                  <p className="text-[10px] text-[var(--text-muted)]">3D stereo widening</p>
                </div>
              </div>
              <button
                onClick={() => onSpatialToggle(!spatialAudio)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  spatialAudio ? 'bg-[var(--accent-blue)]' : 'bg-black/20 dark:bg-white/20'
                }`}
                aria-label="Toggle Spatial Audio"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    spatialAudio ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
