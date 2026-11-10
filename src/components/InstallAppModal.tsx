import React from 'react';
import { Download, Monitor, Smartphone, Check, X, Sparkles, Laptop, Shield } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  installPrompt: any;
  onTriggerInstall: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  installPrompt,
  onTriggerInstall
}) => {
  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">Install rext App</h3>
              <p className="text-xs text-[var(--text-muted)]">Native desktop & mobile experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature benefits */}
        <div className="space-y-2.5 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-surface)]">
            <Laptop className="w-4 h-4 text-[var(--accent-orange)] flex-shrink-0" />
            <span>Standalone window without browser tabs or address bar</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-surface)]">
            <Sparkles className="w-4 h-4 text-[var(--accent-blue)] flex-shrink-0" />
            <span>Hardware accelerated audio DSP & media keyboard controls</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-surface)]">
            <Smartphone className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Works seamlessly on Windows, Mac, Android & iOS</span>
          </div>
        </div>

        {isIOS ? (
          <div className="p-4 rounded-2xl bg-[var(--bg-surface-hover)] border border-[var(--border-color)] space-y-2 text-xs">
            <p className="font-bold text-[var(--text-main)]">How to install on iPhone / iPad:</p>
            <ol className="list-decimal list-inside space-y-1 text-[var(--text-muted)]">
              <li>Tap the <span className="font-semibold text-[var(--text-main)]">Share button (square with arrow)</span> in Safari</li>
              <li>Scroll down and tap <span className="font-semibold text-[var(--text-main)]">'Add to Home Screen'</span></li>
              <li>Tap <span className="font-semibold text-[var(--text-main)]">Add</span> in the top right</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => {
                onTriggerInstall();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-[var(--accent-orange)] text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {installPrompt ? 'Install App on This Device Now' : 'Add to Desktop / Homescreen'}
            </button>
            <p className="text-[11px] text-center text-[var(--text-sub)]">
              Installs instantly in 1 second. Zero storage bloat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default InstallAppModal;

