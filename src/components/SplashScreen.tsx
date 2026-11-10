import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onLoaded: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + 25;
        } else {
          clearInterval(timer);
          setProgress(100);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(onLoaded, 400);
          }, 200);
          return 100;
        }
      });
    }, 180);

    return () => clearInterval(timer);
  }, [onLoaded]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Soft warm glows */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#FF5500]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#0066FF]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Center Logo & Progress */}
      <div className="relative flex flex-col items-center z-10 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[var(--accent-orange)] text-white flex items-center justify-center font-black text-3xl shadow-lg">
          r
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)]">
            rext
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Loading music experience...
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-48 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-orange)] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
