import { useState, useEffect, useCallback, useRef } from 'react';
import { Track } from '../types';
import { searchUniversalMusic, CURATED_TRACKS } from '../services/musicCatalog';
import { StorageService } from '../services/storageService';

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>(CURATED_TRACKS);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceTimerRef = useRef<number | null>(null);

  // Load search history
  useEffect(() => {
    setSearchHistory(StorageService.getSearchHistory());
  }, []);

  // Debounce search query input (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // Execute search when debounced query updates
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(CURATED_TRACKS);
      setIsSearchingOnline(false);
      return;
    }

    let isCancelled = false;
    setIsSearchingOnline(true);

    searchUniversalMusic(debouncedQuery)
      .then((results) => {
        if (!isCancelled) {
          setSearchResults(results);
          setIsSearchingOnline(false);
        }
      })
      .catch((err) => {
        console.warn('Search execution note:', err);
        if (!isCancelled) {
          setIsSearchingOnline(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const selectHistoryTerm = useCallback((term: string) => {
    setSearchQuery(term);
    StorageService.addSearchHistory(term);
    setSearchHistory(StorageService.getSearchHistory());
  }, []);

  const clearHistory = useCallback(() => {
    StorageService.clearSearchHistory();
    setSearchHistory([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchResults,
    isSearchingOnline,
    searchHistory,
    selectHistoryTerm,
    clearHistory,
  };
}

