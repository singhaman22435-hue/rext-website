import { useEffect, useCallback } from 'react';
import { Track, Playlist } from '../types';
import {
  libraryStore,
  useLikedTrackIds,
  useUserPlaylists,
  useDownloads,
  useSelectedPlaylist,
} from '../stores/libraryStore';
import { StorageService } from '../services/storageService';

export function useLibrary() {
  const likedTrackIds = useLikedTrackIds();
  const userPlaylists = useUserPlaylists();
  const downloads = useDownloads();
  const selectedPlaylist = useSelectedPlaylist();

  useEffect(() => {
    libraryStore.loadInitial();
  }, []);

  const toggleLike = useCallback((trackId: string) => {
    libraryStore.toggleLike(trackId);
  }, []);

  const selectPlaylist = useCallback((playlist: Playlist | null) => {
    libraryStore.selectPlaylist(playlist);
  }, []);

  const createPlaylist = useCallback((name: string, description: string) => {
    const newPl = StorageService.createUserPlaylist(name, description);
    libraryStore.addUserPlaylist(newPl);
    return newPl;
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    libraryStore.removeUserPlaylist(playlistId);
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    const updated = StorageService.addTrackToPlaylist(playlistId, track.id);
    libraryStore.setState({ userPlaylists: updated });
  }, []);

  return {
    likedTrackIds,
    userPlaylists,
    downloads,
    selectedPlaylist,
    toggleLike,
    selectPlaylist,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
  };
}

