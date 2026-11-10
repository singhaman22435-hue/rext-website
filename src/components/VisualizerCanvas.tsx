import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Activity, Radio, Disc } from 'lucide-react';

interface VisualizerCanvasProps {
  className?: string;
  height?: number;
  mode?: 'bars' | 'wave' | 'bass-ring';
  showControls?: boolean;
  isPlaying?: boolean;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  className = '',
  height = 120,
  mode: initialMode = 'bars',
  showControls = true,
  isPlaying = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentMode, setCurrentMode] = useState<'bars' | 'wave' | 'bass-ring'>(initialMode);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 128;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

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

      // Check if there is active sound
      let sum = 0;
      for (let i = 0; i < 20; i++) {
        sum += freqData[i];
      }

      // If playing YouTube or external audio where WebAudio analyser is silent, generate rhythmic live reactive waveform
      if (sum < 5 && isPlaying) {
        const time = performance.now() * 0.005;
        for (let i = 0; i < bufferLength; i++) {
          const wave1 = Math.sin(time * 1.5 + i * 0.2);
          const wave2 = Math.cos(time * 2.8 + i * 0.4);
          const beat = Math.pow((Math.sin(time * 2.2) + 1) / 2, 3);
          const val = Math.max(15, Math.min(240, (wave1 * 0.35 + wave2 * 0.35 + beat * 0.45 + 0.35) * 160));
          freqData[i] = val;
          timeData[i] = 128 + Math.sin(time * 3 + i * 0.25) * 45;
        }
        sum = 25 * 20;
      }

      const bassEnergy = sum / 20; // 0 - 255

      if (currentMode === 'bars') {
        // Mode 1: Neon Equalizer Bars (Orange & Electric Blue)
        const barCount = 36;
        const barWidth = (width / barCount) * 0.72;
        const gap = (width / barCount) * 0.28;

        for (let i = 0; i < barCount; i++) {
          const sampleIndex = Math.floor((i / barCount) * (bufferLength / 2));
          const value = freqData[sampleIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.max(4, percent * (h - 10));

          const x = i * (barWidth + gap) + gap / 2;
          const y = h - barHeight;

          // Gradient: Orange at the top, Electric Blue at the base
          const gradient = ctx.createLinearGradient(0, y, 0, h);
          gradient.addColorStop(0, '#FF5C00');
          gradient.addColorStop(0.3, '#FF7A26');
          gradient.addColorStop(0.7, '#00D4FF');
          gradient.addColorStop(1, '#0066FF');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 1, 1]);
          ctx.fill();

          // Glowing peak cap
          if (barHeight > 10) {
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FF5C00';
            ctx.shadowBlur = 8;
            ctx.fillRect(x, y - 2, barWidth, 2);
            ctx.shadowBlur = 0;
          }
        }
      } else if (currentMode === 'wave') {
        // Mode 2: Neon Oscilloscope Wave
        ctx.lineWidth = 2.5;
        const waveGradient = ctx.createLinearGradient(0, 0, width, 0);
        waveGradient.addColorStop(0, '#0066FF');
        waveGradient.addColorStop(0.5, '#00D4FF');
        waveGradient.addColorStop(0.8, '#FF5C00');
        waveGradient.addColorStop(1, '#FFFFFF');

        ctx.strokeStyle = waveGradient;
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 12;

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
        const baseRadius = Math.min(centerX, centerY) * 0.45;
        const dynamicRadius = baseRadius + (bassEnergy / 255) * (baseRadius * 0.85);

        // Ambient glow
        ctx.shadowColor = '#FF5C00';
        ctx.shadowBlur = 20;

        // Outer Bass Pulse Ring
        ctx.strokeStyle = 'rgba(255, 92, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, dynamicRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Inner Blue Ring
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.7, 0, 2 * Math.PI);
        ctx.stroke();

        // Center Bass Core
        const coreGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          2,
          centerX,
          centerY,
          baseRadius * 0.5
        );
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.5, '#FF5C00');
        coreGradient.addColorStop(1, '#08080B');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.4, 0, 2 * Math.PI);
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
  }, [currentMode]);

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
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-[var(--bg-card)]/90 backdrop-blur-md px-2 py-1 rounded-lg border border-[var(--border-color)] text-[10px] shadow-sm">
          <button
            onClick={() => setCurrentMode('bars')}
            className={`p-1 rounded flex items-center gap-1 transition-colors ${
              currentMode === 'bars'
                ? 'bg-[var(--accent-orange)] text-white font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Frequency Bars"
          >
            <Activity className="w-3 h-3" />
            <span>Bars</span>
          </button>
          <button
            onClick={() => setCurrentMode('wave')}
            className={`p-1 rounded flex items-center gap-1 transition-colors ${
              currentMode === 'wave'
                ? 'bg-[var(--accent-blue)] text-white font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Laser Waveform"
          >
            <Radio className="w-3 h-3" />
            <span>Wave</span>
          </button>
          <button
            onClick={() => setCurrentMode('bass-ring')}
            className={`p-1 rounded flex items-center gap-1 transition-colors ${
              currentMode === 'bass-ring'
                ? 'bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-blue)] text-white font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
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

