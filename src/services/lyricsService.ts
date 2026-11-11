import { LyricLine, Track } from '../types';

interface LRCLibResponse {
  id?: number;
  name?: string;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
}

export interface LyricsResult {
  synced: LyricLine[];
  plain?: string;
  source: 'lrclib' | 'curated' | 'custom' | 'none';
  isInstrumental?: boolean;
}

const LYRICS_CACHE_PREFIX = 'rext_lyrics_cache_';
const CUSTOM_LYRICS_PREFIX = 'rext_custom_lyrics_';

export class LyricsService {
  /**
   * Clean titles by removing extraneous YouTube suffixes like (Official Video), [MV], (Audio), etc.
   */
  static cleanTitle(title: string): string {
    if (!title) return '';
    return title
      .replace(/\[[^\]]*\]/g, '') // remove [...]
      .replace(/\((?:official|music|video|audio|lyric|visualizer|hq|hd|remix|acoustic|live|version|edit|extended)[^)]*\)/gi, '')
      .replace(/(?:official\s*(?:music)?\s*(?:video|audio)|visualizer|hd|4k|audio)/gi, '')
      .replace(/feat\..*$/i, '')
      .replace(/ft\..*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Clean artist string
   */
  static cleanArtist(artist: string): string {
    if (!artist) return '';
    return artist
      .replace(/feat\..*$/i, '')
      .replace(/ft\..*$/i, '')
      .replace(/ - Topic$/i, '')
      .replace(/VEVO$/i, '')
      .trim();
  }

  /**
   * Parse standard LRC format string into LyricLine[]
   * E.g. [01:23.45] Some lyric text
   */
  static parseLRC(lrcText: string): LyricLine[] {
    if (!lrcText || typeof lrcText !== 'string') return [];

    const lines = lrcText.split('\n');
    const result: LyricLine[] = [];
    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Skip metadata tags like [ar: Artist], [ti: Title], etc.
      if (/^\[(ti|ar|al|by|offset|length|re|ve):/i.test(line)) {
        continue;
      }

      // Find all timestamps in the line (handles [00:10.00][00:20.00] line)
      let match: RegExpExecArray | null;
      const timestamps: number[] = [];
      timeRegex.lastIndex = 0;

      while ((match = timeRegex.exec(line)) !== null) {
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const ms = match[3] ? parseFloat(`0.${match[3]}`) : 0;
        timestamps.push(mins * 60 + secs + ms);
      }

      if (timestamps.length > 0) {
        const text = line.replace(timeRegex, '').trim();
        // If line is not empty or contains a vocal pause marker
        if (text) {
          for (const time of timestamps) {
            result.push({ time, text });
          }
        }
      }
    }

    // Sort by timestamp
    result.sort((a, b) => a.time - b.time);
    return result;
  }

  /**
   * Convert plain lyrics into approximate time-stamped lines based on track duration
   */
  static generatePacedLyrics(plainLyrics: string, duration: number): LyricLine[] {
    if (!plainLyrics) return [];
    const rawLines = plainLyrics
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) return [];

    const totalLines = rawLines.length;
    const effectiveDuration = Math.max(30, duration - 10);
    const interval = effectiveDuration / totalLines;

    return rawLines.map((text, idx) => ({
      time: Math.round(5 + idx * interval),
      text,
    }));
  }

  /**
   * Fetch lyrics with caching & multi-tier search
   */
  static async getLyrics(track: Track): Promise<LyricsResult> {
    if (!track) {
      return { synced: [], source: 'none' };
    }

    // 1. Check custom user lyrics in localStorage
    try {
      const custom = localStorage.getItem(`${CUSTOM_LYRICS_PREFIX}${track.id}`);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (parsed?.synced && parsed.synced.length > 0) {
          return { synced: parsed.synced, plain: parsed.plain, source: 'custom' };
        }
      }
    } catch {
      // ignore
    }

    // 2. Check local lyrics cache
    try {
      const cached = localStorage.getItem(`${LYRICS_CACHE_PREFIX}${track.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.synced && parsed.synced.length > 0) {
          return { ...parsed, source: 'lrclib' };
        }
      }
    } catch {
      // ignore
    }

    // 3. If track already has pre-bundled curated lyrics with more than 5 lines
    if (track.lyrics && track.lyrics.length > 5) {
      return { synced: track.lyrics, source: 'curated' };
    }

    // 4. Fetch from LRCLIB API
    const cleanTitle = this.cleanTitle(track.title);
    const cleanArtist = this.cleanArtist(track.artist);

    try {
      // Try direct exact query
      const params = new URLSearchParams({
        track_name: cleanTitle,
        artist_name: cleanArtist,
      });
      if (track.duration > 0) {
        params.append('duration', Math.round(track.duration).toString());
      }

      let resp = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
      let data: LRCLibResponse | null = null;

      if (resp.ok) {
        data = await resp.json();
      } else {
        // Fallback to search query
        const searchQuery = `${cleanTitle} ${cleanArtist}`.trim();
        const searchResp = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (searchResp.ok) {
          const list: LRCLibResponse[] = await searchResp.json();
          if (Array.isArray(list) && list.length > 0) {
            // Find one with syncedLyrics, or pick first
            data = list.find((item) => item.syncedLyrics) || list[0];
          }
        }
      }

      if (data) {
        if (data.instrumental) {
          const result: LyricsResult = { synced: [], source: 'lrclib', isInstrumental: true };
          this.cacheLyrics(track.id, result);
          return result;
        }

        if (data.syncedLyrics) {
          const synced = this.parseLRC(data.syncedLyrics);
          if (synced.length > 0) {
            const result: LyricsResult = {
              synced,
              plain: data.plainLyrics,
              source: 'lrclib',
            };
            this.cacheLyrics(track.id, result);
            return result;
          }
        }

        if (data.plainLyrics) {
          const paced = this.generatePacedLyrics(data.plainLyrics, track.duration || 180);
          const result: LyricsResult = {
            synced: paced,
            plain: data.plainLyrics,
            source: 'lrclib',
          };
          this.cacheLyrics(track.id, result);
          return result;
        }
      }
    } catch (e) {
      console.warn('LRCLIB lyrics fetch failed:', e);
    }

    // 5. Fallback to track's bundled lyrics if present
    if (track.lyrics && track.lyrics.length > 0) {
      return { synced: track.lyrics, source: 'curated' };
    }

    return { synced: [], source: 'none' };
  }

  /**
   * Search LRCLIB manually with custom user search query
   */
  static async searchLyrics(query: string): Promise<LRCLibResponse[]> {
    if (!query.trim()) return [];
    try {
      const resp = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
      if (resp.ok) {
        const data = await resp.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.warn('Manual lyrics search error:', e);
    }
    return [];
  }

  /**
   * Save custom user-provided lyrics
   */
  static saveCustomLyrics(trackId: string, text: string): LyricsResult {
    let synced: LyricLine[] = [];
    if (text.includes('[') && text.includes(']')) {
      synced = this.parseLRC(text);
    }
    if (synced.length === 0) {
      synced = this.generatePacedLyrics(text, 200);
    }

    const result: LyricsResult = {
      synced,
      plain: text,
      source: 'custom',
    };

    try {
      localStorage.setItem(`${CUSTOM_LYRICS_PREFIX}${trackId}`, JSON.stringify(result));
    } catch {
      // ignore
    }
    return result;
  }

  /**
   * Save lyrics to local cache
   */
  private static cacheLyrics(trackId: string, result: LyricsResult): void {
    try {
      localStorage.setItem(
        `${LYRICS_CACHE_PREFIX}${trackId}`,
        JSON.stringify({
          synced: result.synced,
          plain: result.plain,
          isInstrumental: result.isInstrumental,
        })
      );
    } catch {
      // localstorage full or blocked
    }
  }
}

