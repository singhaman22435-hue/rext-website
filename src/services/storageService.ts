import { get, set, del } from 'idb-keyval';
import { Track, DownloadItem } from '../types';

const LIKED_KEY = 'rext_liked_tracks';
const RECENT_KEY = 'rext_recent_tracks';
const PLAYLISTS_KEY = 'rext_playlists';
const OFFLINE_AUDIO_PREFIX = 'rext_offline_audio_';
const DOWNLOAD_ITEMS_KEY = 'rext_download_items';

export class StorageService {
  /**
   * Liked Songs
   */
  static getLikedTrackIds(): string[] {
    try {
      const data = localStorage.getItem(LIKED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static toggleLikeTrack(trackId: string): string[] {
    const list = this.getLikedTrackIds();
    const index = list.indexOf(trackId);
    let updated: string[];
    if (index >= 0) {
      updated = list.filter((id) => id !== trackId);
    } else {
      updated = [trackId, ...list];
    }
    localStorage.setItem(LIKED_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Recent Tracks
   */
  static getRecentTrackIds(): string[] {
    try {
      const data = localStorage.getItem(RECENT_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addRecentTrack(trackId: string): string[] {
    const list = this.getRecentTrackIds().filter((id) => id !== trackId);
    const updated = [trackId, ...list].slice(0, 30);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Offline Audio Storage (IndexedDB)
   */
  static async saveOfflineAudioBlob(trackId: string, blob: Blob): Promise<void> {
    await set(`${OFFLINE_AUDIO_PREFIX}${trackId}`, blob);
  }

  static async getOfflineAudioBlob(trackId: string): Promise<Blob | undefined> {
    return await get<Blob>(`${OFFLINE_AUDIO_PREFIX}${trackId}`);
  }

  static async removeOfflineAudio(trackId: string): Promise<void> {
    await del(`${OFFLINE_AUDIO_PREFIX}${trackId}`);
  }

  /**
   * Download item metadata
   */
  static async getDownloadItems(): Promise<DownloadItem[]> {
    try {
      const items = await get<DownloadItem[]>(DOWNLOAD_ITEMS_KEY);
      return items || [];
    } catch {
      return [];
    }
  }

  static async saveDownloadItem(item: DownloadItem): Promise<void> {
    const items = await this.getDownloadItems();
    const existingIdx = items.findIndex((i) => i.trackId === item.trackId);
    if (existingIdx >= 0) {
      items[existingIdx] = item;
    } else {
      items.unshift(item);
    }
    await set(DOWNLOAD_ITEMS_KEY, items);
  }

  static async removeDownloadItem(trackId: string): Promise<void> {
    const items = await this.getDownloadItems();
    const filtered = items.filter((i) => i.trackId !== trackId);
    await set(DOWNLOAD_ITEMS_KEY, filtered);
    await this.removeOfflineAudio(trackId);
  }

  /**
   * Trigger actual direct file download to user's computer (.mp3)
   */
  static triggerBrowserDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

