import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Sliding window rate limiter for security against scrapers/DDoS
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count++;
  return false;
}

function youtubeSearchPlugin(): Plugin {
  return {
    name: 'youtube-search-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Apply Global Security Headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        if (!req.url?.startsWith('/api/yt-search')) {
          return next();
        }

        // Rate Limiting Check
        const clientIp = req.socket.remoteAddress || '127.0.0.1';
        if (isRateLimited(clientIp)) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Retry-After', '60');
          res.end(JSON.stringify({ error: 'Too Many Requests. Rate limit exceeded.' }));
          return;
        }

        try {
          const parsedUrl = new URL(req.url, 'http://127.0.0.1:3000');
          const rawQuery = parsedUrl.searchParams.get('q') || '';

          // Strict query sanitization & length restriction
          const sanitizedQuery = rawQuery
            .replace(/[^\w\s\u0900-\u097F\u0A00-\u0A7F.,!?-]/gi, '')
            .trim()
            .substring(0, 80);

          if (!sanitizedQuery) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
            return;
          }

          const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(sanitizedQuery + ' song')}`;
          const response = await fetch(ytUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          });

          const html = await response.text();
          const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
          const results: any[] = [];

          if (match) {
            try {
              const data = JSON.parse(match[1]);
              const sections =
                data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
                  ?.sectionListRenderer?.contents || [];

              for (const sec of sections) {
                const items = sec?.itemSectionRenderer?.contents || [];
                for (const item of items) {
                  if (item.videoRenderer && item.videoRenderer.videoId) {
                    const v = item.videoRenderer;
                    const videoId = String(v.videoId).replace(/[^\w-]/g, '').substring(0, 11);
                    if (!videoId || videoId.length !== 11) continue;

                    const rawTitle = (
                      v.title?.runs?.map((r: any) => r.text).join('') ||
                      v.title?.simpleText ||
                      ''
                    ).replace(/<[^>]*>/g, '').trim().substring(0, 120);

                    const channel = (
                      v.ownerText?.runs?.map((r: any) => r.text).join('') ||
                      'YouTube Artist'
                    ).replace(/<[^>]*>/g, '').trim().substring(0, 80);

                    const lengthText = v.lengthText?.simpleText || '3:30';

                    let durationSec = 210;
                    if (lengthText) {
                      const parts = lengthText.split(':').map(Number);
                      if (parts.length === 2)
                        durationSec = parts[0] * 60 + parts[1];
                      else if (parts.length === 3)
                        durationSec =
                          parts[0] * 3600 + parts[1] * 60 + parts[2];
                    }

                    results.push({
                      id: `yt-${videoId}`,
                      youtubeId: videoId,
                      source: 'youtube',
                      title: rawTitle,
                      artist: channel,
                      album: 'YouTube Music',
                      coverUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                      audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
                      duration: durationSec,
                      genre: 'YouTube',
                      bitrate: 'YouTube HQ Audio',
                      year: new Date().getFullYear(),
                      bassLevel: 85,
                      plays: Math.floor(Math.random() * 4000000) + 1000000,
                    });

                    if (results.length >= 25) break;
                  }
                }
                if (results.length >= 25) break;
              }
            } catch (err) {
              console.warn('ytInitialData parse note:', err);
            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(results));
        } catch (error: any) {
          // Never leak internal stack traces to the public
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Search service temporarily unavailable.' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), youtubeSearchPlugin()],
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/dist-app/**', '**/release/**', '**/.git/**'],
    },
  },
});
