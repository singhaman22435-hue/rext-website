import { Track } from '../types';

interface CacheEntry {
  timestamp: number;
  results: Track[];
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const MIN_QUERY_LENGTH = 2;

/**
 * Normalizes title string by stripping redundant "Official Video", "| HD", etc.
 */
export function cleanYouTubeTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?(?:Video|Audio|HD|4K|Visualizer|Lyric\s*Video)?|Full\s*Video\s*Song|Video|Audio)[\)\]]/gi, '')
    .replace(/\s*\|\s*.*$/g, '')
    .replace(/<[^>]*>/g, '')
    .trim() || rawTitle;
}

/**
 * Parses raw HTML search results from YouTube with resilient multi-structure parsing.
 */
export function parseYouTubeSearchHtml(html: string): Track[] {
  const results: Track[] = [];
  const seenIds = new Set<string>();

  // 1. Try JSON extraction from ytInitialData
  const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      const sections =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents || [];

      for (const sec of sections) {
        const items = sec?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const v = item.videoRenderer;
          if (!v || !v.videoId) continue;

          const videoId = String(v.videoId).replace(/[^\w-]/g, '').substring(0, 11);
          if (!videoId || videoId.length !== 11 || seenIds.has(videoId)) continue;
          seenIds.add(videoId);

          const rawTitle = (
            v.title?.runs?.map((r: any) => r.text).join('') ||
            v.title?.simpleText ||
            ''
          );

          const channel = (
            v.ownerText?.runs?.map((r: any) => r.text).join('') ||
            'YouTube Artist'
          ).replace(/<[^>]*>/g, '').trim().substring(0, 80);

          const lengthText = v.lengthText?.simpleText || '3:30';
          let durationSec = 210;
          if (lengthText) {
            const parts = lengthText.split(':').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              durationSec = parts[0] * 60 + parts[1];
            } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
              durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
          }

          results.push({
            id: `yt-${videoId}`,
            youtubeId: videoId,
            source: 'youtube',
            title: cleanYouTubeTitle(rawTitle),
            artist: channel,
            album: 'YouTube Music Stream',
            coverUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
            duration: durationSec,
            genre: 'YouTube Music',
            bitrate: 'YouTube HQ Stream',
            year: new Date().getFullYear(),
            bassLevel: 80,
          });
        }
      }
    } catch (e) {
      console.warn('JSON parsing of ytInitialData encountered warning:', e);
    }
  }

  // 2. Fallback regex extraction if sectionListRenderer schema differed
  if (results.length === 0) {
    const videoRegex = /"videoId":"([\w-]{11})".+?"title":\{"runs":\[\{"text":"([^"]+)"/g;
    let m: RegExpExecArray | null;
    let count = 0;
    while ((m = videoRegex.exec(html)) !== null && count < 25) {
      const vid = m[1];
      const rawTitle = m[2];
      if (vid && !seenIds.has(vid)) {
        seenIds.add(vid);
        count++;
        results.push({
          id: `yt-${vid}`,
          youtubeId: vid,
          source: 'youtube',
          title: cleanYouTubeTitle(rawTitle),
          artist: 'YouTube Artist',
          album: 'YouTube Music Stream',
          coverUrl: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
          audioUrl: `https://www.youtube.com/watch?v=${vid}`,
          duration: 210,
          genre: 'YouTube Music',
          bitrate: 'YouTube HQ Stream',
          year: new Date().getFullYear(),
          bassLevel: 80,
        });
      }
    }
  }

  return results;
}

class YouTubeSearchService {
  private cache: Map<string, CacheEntry> = new Map();
  private inFlightRequests: Map<string, Promise<Track[]>> = new Map();
  private activeAbortController: AbortController | null = null;

  /**
   * Search for songs via unified backend/serverless endpoint with deduplication and caching
   */
  public async search(query: string): Promise<Track[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < MIN_QUERY_LENGTH) {
      return [];
    }

    const cacheKey = trimmed.toLowerCase();

    // 1. Check in-memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.results;
    }

    // 2. Deduplicate simultaneous identical in-flight requests
    const pending = this.inFlightRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    // 3. Cancel previous pending request to prevent out-of-order race conditions
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    this.activeAbortController = new AbortController();
    const signal = this.activeAbortController.signal;

    const requestPromise = (async () => {
      try {
        const response = await fetch(`/api/yt-search?q=${encodeURIComponent(trimmed)}`, { signal });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        const tracks: Track[] = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              bitrate: item.bitrate || 'YouTube HQ Stream',
            }))
          : [];

        // Save to cache
        this.cache.set(cacheKey, {
          timestamp: Date.now(),
          results: tracks,
        });

        // Limit cache size to 60 entries
        if (this.cache.size > 60) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) this.cache.delete(firstKey);
        }

        return tracks;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return [];
        }
        console.warn('YouTube search query note:', err);
        return [];
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const youtubeSearchService = new YouTubeSearchService();
export default youtubeSearchService;

