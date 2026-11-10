import React from 'react';
import { DownloadItem, Track } from '../types';
import { StorageService } from '../services/storageService';
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
  if (!isOpen) return null;

  const handleExportFile = async (item: DownloadItem) => {
    const blob = await StorageService.getOfflineAudioBlob(item.trackId);
    if (blob) {
      StorageService.triggerBrowserDownload(
        blob,
        `${item.track.artist} - ${item.track.title}.mp3`
      );
    } else {
      try {
        const resp = await fetch(item.track.audioUrl);
        const newBlob = await resp.blob();
        await StorageService.saveOfflineAudioBlob(item.trackId, newBlob);
        StorageService.triggerBrowserDownload(
          newBlob,
          `${item.track.artist} - ${item.track.title}.mp3`
        );
      } catch (e) {
        alert('Could not export audio file directly due to network CORS.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] flex items-center justify-center border border-[var(--accent-blue)]/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Downloads */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
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
                      className="w-12 h-12 rounded-xl object-cover shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[var(--text-main)] truncate flex items-center gap-1.5">
                        {item.track.title}
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-blue)] flex-shrink-0" />
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onPlayTrack(item.track)}
                      className={`p-2 rounded-xl transition-all ${
                        isPlaying
                          ? 'bg-[var(--accent-orange)] text-white shadow-sm'
                          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-main)]'
                      }`}
                      title="Play Track"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => handleExportFile(item)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-[var(--accent-blue)] text-[var(--text-muted)] hover:text-white transition-all"
                      title="Save MP3 file to computer"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteDownload(item.trackId)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500 transition-all"
                      title="Remove from Offline Storage"
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
