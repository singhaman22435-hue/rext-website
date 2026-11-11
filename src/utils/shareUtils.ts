import { Track } from '../types';

export interface ShareResult {
  success: boolean;
  type: 'native' | 'clipboard';
  message: string;
}

export async function shareTrack(track: Track): Promise<ShareResult> {
  const url = `${window.location.origin}/?track=${encodeURIComponent(track.id)}`;
  const title = `${track.title} - ${track.artist}`;
  const text = `Listen to "${track.title}" by ${track.artist} on Rext Music!`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { success: true, type: 'native', message: 'Shared successfully!' };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return { success: false, type: 'native', message: 'Share canceled' };
      }
      // fallback to clipboard
    }
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(url);
    return {
      success: true,
      type: 'clipboard',
      message: 'Direct track link copied to clipboard!',
    };
  } catch {
    return {
      success: false,
      type: 'clipboard',
      message: 'Could not copy link to clipboard.',
    };
  }
}
