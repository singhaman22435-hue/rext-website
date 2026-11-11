import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, HardDrive, X } from 'lucide-react';

interface OfflineBannerProps {
  onOpenDownloads: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onOpenDownloads }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setIsDismissed(false);
      setTimeout(() => setShowReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isDismissed) return null;

  if (isOffline) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/90 dark:bg-zinc-900/90 text-white backdrop-blur-xl border border-red-500/40 shadow-2xl animate-slide-up text-xs font-medium">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
        <span>You are currently offline.</span>
        <button
          onClick={onOpenDownloads}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-colors"
        >
          <HardDrive className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
          Play Downloads
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-950/90 text-emerald-200 backdrop-blur-xl border border-emerald-500/40 shadow-xl animate-slide-up text-xs font-semibold">
        <Wifi className="w-4 h-4 text-emerald-400" />
        <span>Back online! Streaming restored.</span>
      </div>
    );
  }

  return null;
};
