import React, { useState } from 'react';
import { Track } from '../types';
import { Link2, Upload, Music, X, Play } from 'lucide-react';
import { YoutubeIcon } from './YoutubeIcon';
import { sanitizeText, sanitizeSafeUrl } from '../utils/security';

interface ImportAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (track: Track) => void;
}

export const ImportAudioModal: React.FC<ImportAudioModalProps> = ({
  isOpen,
  onClose,
  onAddTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const extractYouTubeId = (inputUrl: string): string | null => {
    const match = inputUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const detectedYtId = extractYouTubeId(url);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid audio or stream URL');
      return;
    }

    const ytId = extractYouTubeId(url.trim());

    if (ytId) {
      const cleanTitle = sanitizeText(title.trim(), 80) || 'Studio Master Track';
      const cleanArtist = sanitizeText(artist.trim(), 60) || 'Studio Master Artist';

      const newTrack: Track = {
        id: `yt-${ytId}`,
        youtubeId: ytId,
        source: 'youtube',
        title: cleanTitle,
        artist: cleanArtist,
        album: 'Studio Master Stream',
        coverUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        audioUrl: `https://www.youtube.com/watch?v=${ytId}`,
        duration: 220,
        genre: 'Pop',
        bitrate: '320 kbps Master',
        year: new Date().getFullYear(),
        bassLevel: 85,
        plays: 500000,
      };

      onAddTrack(newTrack);
      onClose();
      return;
    }

    const safeUrl = sanitizeSafeUrl(url.trim());
    if (!safeUrl) {
      setError('Insecure URL detected. Only secure https:// URLs are allowed.');
      return;
    }

    const cleanTitle = sanitizeText(title.trim(), 80) || safeUrl.split('/').pop()?.split('?')[0] || 'Custom Track';
    const cleanArtist = sanitizeText(artist.trim(), 60) || 'Web Stream';

    const newTrack: Track = {
      id: `custom-url-${Date.now()}`,
      title: cleanTitle,
      artist: cleanArtist,
      album: 'Web Stream',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
      audioUrl: safeUrl,
      duration: 180,
      genre: 'Custom',
      bitrate: '320 kbps',
      year: new Date().getFullYear(),
      bassLevel: 90,
      plays: 1,
    };

    onAddTrack(newTrack);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name.replace(/\.[^/.]+$/, '');

    const newTrack: Track = {
      id: `custom-file-${Date.now()}`,
      title: fileName,
      artist: 'Local Audio',
      album: 'My Files',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
      audioUrl: fileUrl,
      duration: 210,
      genre: 'Local',
      bitrate: 'Original Master',
      year: new Date().getFullYear(),
      bassLevel: 90,
      plays: 1,
    };

    onAddTrack(newTrack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-orange)] text-white flex items-center justify-center shadow-sm">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">Import Any Music</h3>
              <p className="text-xs text-[var(--text-muted)]">YouTube link, audio stream, or local file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 rounded-xl bg-[var(--bg-surface-hover)]">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'url' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Paste Audio / Video URL
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'file' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {activeTab === 'url' ? (
          <form onSubmit={handleUrlSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-main)] flex items-center justify-between">
                <span>Stream Link or Audio URL</span>
                {detectedYtId && (
                  <span className="text-[10px] text-[var(--accent-orange)] font-bold flex items-center gap-1">
                    <Music2 className="w-3.5 h-3.5" /> HD Audio Stream Detected
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <Link2 className="absolute left-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError('');
                  }}
                  placeholder="Paste any music link or .mp3 URL..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-sub)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
              </div>
            </div>

            {detectedYtId && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-color)]">
                <img
                  src={`https://i.ytimg.com/vi/${detectedYtId}/hqdefault.jpg`}
                  alt="Track artwork"
                  className="w-16 h-10 object-cover rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--text-main)] truncate">High-Res Stream Ready</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">Lossless Audio Pipeline</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-main)]">Song Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song name"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-sub)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-main)]">Artist (Optional)</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artist name"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-sub)] focus:outline-none focus:border-[var(--accent-orange)]"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[var(--accent-orange)] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Stream Now
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-orange)] rounded-2xl p-6 cursor-pointer bg-[var(--bg-surface)] transition-all group">
              <Upload className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--accent-orange)] mb-2 transition-colors" />
              <span className="text-xs font-bold text-[var(--text-main)]">Choose an audio file from your device</span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1">Supports MP3, WAV, FLAC, AAC, OGG</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
