import { Track } from '../types';
import { StorageService } from './storageService';

export class DownloadService {
  /**
   * Get direct MP3 download or converter URL for any track
   */
  static getDownloadUrl(track: Track): string {
    const ytId =
      track.youtubeId || (track.audioUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];
    if (ytId) {
      // High-speed direct MP3 converter link
      return `https://loader.to/api/button/?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${ytId}&f=mp3`;
    }
    return track.audioUrl;
  }

  /**
   * Trigger direct device download of the MP3 file to computer/phone
   */
  static async downloadTrackToDevice(track: Track): Promise<{ success: boolean; message: string }> {
    // 1. If we already have a cached audio blob in IndexedDB, export directly as MP3
    const offlineBlob = await StorageService.getOfflineAudioBlob(track.id);
    if (offlineBlob) {
      StorageService.triggerBrowserDownload(offlineBlob, `${track.artist} - ${track.title}.mp3`);
      return {
        success: true,
        message: `Exporting "${track.title}" MP3 to your downloads...`,
      };
    }

    const ytId =
      track.youtubeId || (track.audioUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1];

    if (ytId) {
      // 2. Open high-speed 320kbps MP3 download gateway in a clean new tab
      const downloadGateway = `https://loader.to/api/button/?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${ytId}&f=mp3`;
      window.open(downloadGateway, '_blank', 'noopener,noreferrer');
      return {
        success: true,
        message: `Opening high-speed 320kbps MP3 downloader for "${track.title}"...`,
      };
    }

    // 3. For direct audio URLs
    try {
      const resp = await fetch(track.audioUrl);
      const blob = await resp.blob();
      await StorageService.saveOfflineAudioBlob(track.id, blob);
      StorageService.triggerBrowserDownload(blob, `${track.artist} - ${track.title}.mp3`);
      return {
        success: true,
        message: `Downloaded "${track.title}.mp3" to your device!`,
      };
    } catch {
      window.open(track.audioUrl, '_blank');
      return { success: true, message: `Opening audio stream...` };
    }
  }
}

