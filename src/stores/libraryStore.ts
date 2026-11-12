import { useSyncExternalStore } from 'react';
import { Playlist, DownloadItem, Track } from '../types';
import { StorageService } from '../services/storageService';

export interface LibraryState {
  likedTrackIds: string[];
  userPlaylists: Playlist[];
  downloads: DownloadItem[];
  history: Track[];
  selectedPlaylist: Playlist | null;
}

const initialState: LibraryState = {
  likedTrackIds: [],
  userPlaylists: [],
  downloads: [],
  history: [],
  selectedPlaylist: null,
};

type Listener = () => void;

class LibraryStore {
  private state: LibraryState = { ...initialState };
  private listeners: Set<Listener> = new Set();
  private isLoaded = false;

  public getState(): LibraryState {
    return this.state;
  }

  public setState(partial: Partial<LibraryState> | ((prev: LibraryState) => Partial<LibraryState>)): void {
    const next = typeof partial === 'function' ? partial(this.state) : partial;
    this.state = { ...this.state, ...next };
    this.notify();
  }

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public async loadInitial(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const [liked, userPls, dls] = await Promise.all([
        StorageService.getLikedTrackIds(),
        Promise.resolve(StorageService.getUserPlaylists()),
        StorageService.getDownloadItems(),
      ]);
      this.state = {
        ...this.state,
        likedTrackIds: liked,
        userPlaylists: userPls,
        downloads: dls,
      };
      this.isLoaded = true;
      this.notify();
    } catch (err) {
      console.warn('LibraryStore load error:', err);
    }
  }

  public toggleLike(trackId: string): void {
    const nextLiked = StorageService.toggleLikeTrack(trackId);
    this.setState({ likedTrackIds: nextLiked });
  }

  public selectPlaylist(playlist: Playlist | null): void {
    this.setState({ selectedPlaylist: playlist });
  }

  public addUserPlaylist(playlist: Playlist): void {
    this.setState((prev) => ({
      userPlaylists: [playlist, ...prev.userPlaylists],
    }));
  }

  public removeUserPlaylist(playlistId: string): void {
    StorageService.deleteUserPlaylist(playlistId);
    this.setState((prev) => ({
      userPlaylists: prev.userPlaylists.filter((p) => p.id !== playlistId),
      selectedPlaylist: prev.selectedPlaylist?.id === playlistId ? null : prev.selectedPlaylist,
    }));
  }
}

export const libraryStore = new LibraryStore();

export function useLibraryStore<T>(selector: (state: LibraryState) => T): T {
  return useSyncExternalStore(
    libraryStore.subscribe,
    () => selector(libraryStore.getState()),
    () => selector(initialState)
  );
}

export const useLikedTrackIds = () => useLibraryStore((s) => s.likedTrackIds);
export const useUserPlaylists = () => useLibraryStore((s) => s.userPlaylists);
export const useDownloads = () => useLibraryStore((s) => s.downloads);
export const useSelectedPlaylist = () => useLibraryStore((s) => s.selectedPlaylist);
