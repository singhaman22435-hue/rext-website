import React, { useEffect } from 'react';
import { DownloadItem, Track } from '../types';
import { StorageService } from '../services/storageService';
import { DownloadService } from '../services/downloadService';
import {
  Download,
  Trash2,
  HardDrive,
  CheckCircle2,
  Play,
  FileAudio,
  X,
  Sparkles
} from 'lucide-react';

interface DownloadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: DownloadItem[];
  onPlayTrack: (track: Track) => void;
  onDeleteDownload: (trackId: string) => void;
  currentPlayingId?: string;
}

export const DownloadManagerModal: React.FC<DownloadManagerModalProps> = ({
  isOpen,
  onClose,
  downloads,
  onPlayTrack,
  onDeleteDownload,
  currentPlayingId,
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

  const handleExportFile = async (item: DownloadItem) => {
    await DownloadService.downloadTrackToDevice(item.track);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-manager-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[var(--border-color)] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] flex items-center justify-center border border-[var(--accent-blue)]/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 id="download-manager-title" className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                Downloads
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] font-mono font-bold">
                  {downloads.length} Songs
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Play offline or export as MP3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            aria-label="Close Downloads"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Downloads */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {downloads.length > 0 ? (
            downloads.map((item) => {
              const isPlaying = currentPlayingId === item.trackId;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isPlaying
                      ? 'bg-[var(--bg-surface)] border-[var(--accent-orange)] shadow-md'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.track.coverUrl}
                      alt={item.track.title}
                      className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--text-main)] truncate flex items-center gap-1.5">
                        <span className="truncate">{item.track.title}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-blue)] shrink-0" />
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{item.track.artist}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-sub)] mt-0.5">
                        <span className="text-[var(--accent-orange)] font-mono font-bold">{item.track.bitrate}</span>
                        <span>•</span>
                        <span>{item.blobSize || 'HQ Audio'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onPlayTrack(item.track)}
                      className={`p-2 rounded-xl transition-all ${
                        isPlaying
                          ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-main)]'
                      }`}
                      title="Play Track"
                      aria-label={`Play ${item.track.title}`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => handleExportFile(item)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[var(--accent-blue)] text-[var(--text-muted)] hover:text-white transition-all"
                      title="Save MP3 file to computer"
                      aria-label="Export MP3"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteDownload(item.trackId)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500 transition-all"
                      title="Remove from Offline Storage"
                      aria-label="Delete offline track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center space-y-3">
              <FileAudio className="w-12 h-12 text-[var(--accent-orange)] mx-auto opacity-70 animate-pulse" />
              <h4 className="text-base font-bold text-[var(--text-main)]">No Offline Tracks Saved Yet</h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Click the download icon <Download className="w-3 h-3 inline text-[var(--accent-blue)]" /> on any song to save it for offline listening!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 text-[var(--text-main)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            Encrypted Offline Cache (IndexedDB)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-main)] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
