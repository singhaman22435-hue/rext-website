import { get, set, del } from 'idb-keyval';
import { Track, DownloadItem, Playlist } from '../types';

const LIKED_KEY = 'rext_liked_tracks';
const RECENT_KEY = 'rext_recent_tracks';
const USER_PLAYLISTS_KEY = 'rext_user_playlists';
const OFFLINE_AUDIO_PREFIX = 'rext_offline_audio_';
const DOWNLOAD_ITEMS_KEY = 'rext_download_items';
const SEARCH_HISTORY_KEY = 'rext_search_history';

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
   * Custom User Playlists (CRUD)
   */
  static getUserPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(USER_PLAYLISTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static createUserPlaylist(name: string, description: string): Playlist {
    const playlists = this.getUserPlaylists();
    const id = `user-pl-${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      name,
      description: description || 'Custom collection of favorite songs',
      coverUrl:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
      trackIds: [],
    };
    playlists.unshift(newPlaylist);
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
    return newPlaylist;
  }

  static addTrackToPlaylist(playlistId: string, trackId: string): Playlist[] {
    const playlists = this.getUserPlaylists();
    const target = playlists.find((p) => p.id === playlistId);
    if (target) {
      if (!target.trackIds.includes(trackId)) {
        target.trackIds.push(trackId);
      }
      localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
    }
    return playlists;
  }

  static removeTrackFromPlaylist(playlistId: string, trackId: string): Playlist[] {
    const playlists = this.getUserPlaylists();
    const target = playlists.find((p) => p.id === playlistId);
    if (target) {
      target.trackIds = target.trackIds.filter((id) => id !== trackId);
      localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
    }
    return playlists;
  }

  static deleteUserPlaylist(playlistId: string): Playlist[] {
    const playlists = this.getUserPlaylists().filter((p) => p.id !== playlistId);
    localStorage.setItem(USER_PLAYLISTS_KEY, JSON.stringify(playlists));
    return playlists;
  }

  /**
   * Search History
   */
  static getSearchHistory(): string[] {
    try {
      const data = localStorage.getItem(SEARCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addSearchHistory(term: string): string[] {
    if (!term || !term.trim()) return this.getSearchHistory();
    const clean = term.trim();
    const list = this.getSearchHistory().filter((t) => t.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...list].slice(0, 10);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  }

  static clearSearchHistory(): void {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
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
