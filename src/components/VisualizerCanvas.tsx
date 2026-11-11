import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Track } from '../types';
import { Activity, Radio, Disc } from 'lucide-react';

interface VisualizerCanvasProps {
  className?: string;
  height?: number;
  mode?: 'bars' | 'wave' | 'bass-ring';
  showControls?: boolean;
  isPlaying?: boolean;
  track?: Track | null;
  bassBoost?: number;
  currentTime?: number;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  className = '',
  height = 120,
  mode: initialMode = 'bars',
  showControls = true,
  isPlaying = false,
  track = null,
  bassBoost = 0,
  currentTime = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentMode, setCurrentMode] = useState<'bars' | 'wave' | 'bass-ring'>(initialMode);
  const animationFrameRef = useRef<number | null>(null);

  // Peak caps array for gravity physics
  const peakBarsRef = useRef<number[]>(new Array(36).fill(4));
  const peakDecayRef = useRef<number[]>(new Array(36).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 128;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    // Track musical parameters
    const bpm = track?.bpm || (track?.genre === 'Phonk' ? 160 : track?.genre === 'Hip-Hop' ? 135 : track?.genre === 'EDM' ? 128 : 122);
    const bassLevelScale = ((track?.bassLevel || 85) / 100);
    const boostMultiplier = 1.0 + (bassBoost / 6) * 0.45;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      // Handle retina displays
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== h * dpr) {
        canvas.width = width * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, h);

      audioEngine.getByteFrequencyData(freqData);
      audioEngine.getByteTimeDomainData(timeData);

      let sum = 0;
      for (let i = 0; i < 20; i++) {
        sum += freqData[i];
      }

      const now = performance.now() * 0.001;

      // When playing via YouTube (where WebAudio analyzer is silent), synthesize musical spectrum!
      if (sum < 5 && isPlaying) {
        // True beat cycle from song tempo (BPM)
        const beatFreq = bpm / 60; // beats per second (e.g. ~2.25 Hz for 135 BPM)
        const beatPhase = (now * beatFreq) % 1; // 0 to 1 cycle
        
        // 808 Sub-bass kick impact curve
        const kickDrop = Math.pow(Math.max(0, 1 - beatPhase * 1.7), 2.2) * bassLevelScale * boostMultiplier;
        // Snare / clap transient on 2 and 4
        const snareDrop = Math.pow(Math.max(0, 1 - Math.abs(beatPhase - 0.5) * 4), 2.5);
        // Hi-hat 16th note flutter
        const hihat = Math.sin(now * beatFreq * 8 * Math.PI) * 0.25 + 0.25;

        for (let i = 0; i < bufferLength; i++) {
          const normIdx = i / bufferLength;
          let val = 0;

          if (normIdx < 0.25) {
            // Low frequencies: Sub-bass 30Hz - 200Hz
            const subOsc = Math.sin(now * 30 + i * 0.4) * 0.2 + 0.8;
            val = (kickDrop * 190 * subOsc) + (Math.sin(now * 4 + i) * 20) + (boostMultiplier * 25);
          } else if (normIdx < 0.65) {
            // Mid frequencies: Vocals and Synths 200Hz - 2.5kHz
            const vocalOsc = Math.sin(now * 8 + i * 0.3) * 0.35 + 0.65;
            val = (snareDrop * 110) + (vocalOsc * 95) + (Math.cos(now * 2.5 + i * 0.2) * 25);
          } else {
            // High frequencies: Cymbals and Hi-Hats 2.5kHz - 16kHz
            const trebleOsc = (Math.sin(now * 25 + i * 0.6) + 1) * 0.5;
            val = (hihat * 120 * trebleOsc) + (Math.random() * 20);
          }

          freqData[i] = Math.max(12, Math.min(250, Math.floor(val)));
          timeData[i] = Math.floor(128 + Math.sin(now * 15 + i * 0.3) * (kickDrop * 50 + 20));
        }
        sum = 20 * 60;
      } else if (!isPlaying) {
        // Paused / Standby Mode: Silky smooth breathing ambient studio wave (NEVER dead flat!)
        for (let i = 0; i < bufferLength; i++) {
          const idleWave = (Math.sin(now * 1.5 + i * 0.15) + 1) * 0.5;
          const idleWave2 = (Math.cos(now * 2.2 + i * 0.25) + 1) * 0.5;
          const idleVal = 18 + (idleWave * 0.6 + idleWave2 * 0.4) * 35;
          freqData[i] = Math.floor(idleVal);
          timeData[i] = Math.floor(128 + Math.sin(now * 2 + i * 0.1) * 15);
        }
      }

      const bassEnergy = sum / 20;

      if (currentMode === 'bars') {
        // Mode 1: 36-Band HD Neon Studio Equalizer with Gravity Falling Peak Caps
        const barCount = 36;
        const barWidth = (width / barCount) * 0.72;
        const gap = (width / barCount) * 0.28;

        for (let i = 0; i < barCount; i++) {
          const sampleIndex = Math.floor((i / barCount) * (bufferLength / 2));
          const value = freqData[sampleIndex] || 0;
          const percent = value / 255;
          const targetHeight = Math.max(6, percent * (h - 14));

          // Peak cap physics (Gravity & Decay)
          if (targetHeight >= (peakBarsRef.current[i] || 0)) {
            peakBarsRef.current[i] = targetHeight;
            peakDecayRef.current[i] = 0;
          } else {
            peakDecayRef.current[i] = (peakDecayRef.current[i] || 0) + 0.12;
            peakBarsRef.current[i] = Math.max(targetHeight, (peakBarsRef.current[i] || 0) - peakDecayRef.current[i]);
          }

          const currentPeak = peakBarsRef.current[i];
          const x = i * (barWidth + gap) + gap / 2;
          const y = h - targetHeight;

          // Gradient: Electric Orange at top to Cyan/Blue at base
          const gradient = ctx.createLinearGradient(0, y, 0, h);
          gradient.addColorStop(0, '#FF5500');
          gradient.addColorStop(0.35, '#FF7A26');
          gradient.addColorStop(0.7, '#00D4FF');
          gradient.addColorStop(1, '#0066FF');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, targetHeight, [4, 4, 1, 1]);
          ctx.fill();

          // Floating Peak Cap
          const peakY = h - currentPeak - 2;
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FF5500';
          ctx.shadowBlur = isPlaying ? 6 : 2;
          ctx.fillRect(x, Math.max(2, peakY), barWidth, 2);
          ctx.shadowBlur = 0;
        }
      } else if (currentMode === 'wave') {
        // Mode 2: Neon Oscilloscope Laser Waveform
        ctx.lineWidth = 3;
        const waveGradient = ctx.createLinearGradient(0, 0, width, 0);
        waveGradient.addColorStop(0, '#0066FF');
        waveGradient.addColorStop(0.4, '#00D4FF');
        waveGradient.addColorStop(0.7, '#FF5500');
        waveGradient.addColorStop(1, '#FF7A26');

        ctx.strokeStyle = waveGradient;
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = isPlaying ? 14 : 4;

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (currentMode === 'bass-ring') {
        // Mode 3: Subwoofer Bass Reactor
        const centerX = width / 2;
        const centerY = h / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.42;
        const dynamicRadius = baseRadius + (bassEnergy / 255) * (baseRadius * 0.85);

        ctx.shadowColor = '#FF5500';
        ctx.shadowBlur = isPlaying ? 18 : 6;

        // Outer Pulse Ring
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, dynamicRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Inner Cyan Ring
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.72, 0, 2 * Math.PI);
        ctx.stroke();

        // Core Gradient
        const coreGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          2,
          centerX,
          centerY,
          baseRadius * 0.5
        );
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.6, '#FF5500');
        coreGradient.addColorStop(1, '#0A0A0E');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.42, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      ctx.restore();
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentMode, isPlaying, track?.id, bassBoost, bpm, bassLevelScale, boostMultiplier]);

  return (
    <div className={`relative flex flex-col justify-end overflow-hidden ${className}`}>
      {/* Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px`, width: '100%' }}
        className="block"
      />

      {/* Mode Switcher Pills */}
      {showControls && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-[10px] shadow-sm z-10">
          <button
            onClick={() => setCurrentMode('bars')}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all ${
              currentMode === 'bars'
                ? 'bg-[var(--accent-orange)] text-white font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
            title="Studio Equalizer Bars"
          >
            <Activity className="w-3 h-3" />
            <span>Bars</span>
          </button>
          <button
            onClick={() => setCurrentMode('wave')}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all ${
              currentMode === 'wave'
                ? 'bg-[var(--accent-blue)] text-white font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
            title="Oscilloscope Wave"
          >
            <Radio className="w-3 h-3" />
            <span>Wave</span>
          </button>
          <button
            onClick={() => setCurrentMode('bass-ring')}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all ${
              currentMode === 'bass-ring'
                ? 'bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-blue)] text-white font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
            title="Bass Reactor"
          >
            <Disc className="w-3 h-3" />
            <span>Reactor</span>
          </button>
        </div>
      )}
    </div>
  );
};
