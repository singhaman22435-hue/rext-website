/**
 * Vercel Serverless Function: YouTube Search API
 * Endpoint: /api/yt-search?q=<query>
 * Searches YouTube in real-time and returns normalized music tracks.
 */

export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query?.q || '';
  const sanitizedQuery = String(query)
    .replace(/[^\w\s\u0900-\u097F\u0A00-\u0A7F.,!?-]/gi, '')
    .trim()
    .substring(0, 80);

  if (!sanitizedQuery) {
    return res.status(200).json([]);
  }

  try {
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(sanitizedQuery + ' song')}`;
    const response = await fetch(ytUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return res.status(200).json([]);
    }

    const html = await response.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    const results = [];

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
                v.title?.runs?.map((r) => r.text).join('') ||
                v.title?.simpleText ||
                ''
              ).replace(/<[^>]*>/g, '').trim().substring(0, 120);

              const channel = (
                v.ownerText?.runs?.map((r) => r.text).join('') ||
                'YouTube Artist'
              ).replace(/<[^>]*>/g, '').trim().substring(0, 80);

              const lengthText = v.lengthText?.simpleText || '3:30';

              let durationSec = 210;
              if (lengthText) {
                const parts = lengthText.split(':').map(Number);
                if (parts.length === 2)
                  durationSec = parts[0] * 60 + parts[1];
                else if (parts.length === 3)
                  durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
              }

              const cleanTitle = rawTitle
                .replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?(?:Video|Audio|HD|4K|Visualizer|Lyric\s*Video)?|Full\s*Video\s*Song|Video|Audio)[\)\]]/gi, '')
                .replace(/\s*\|\s*.*$/g, '')
                .trim() || rawTitle;

              results.push({
                id: `yt-${videoId}`,
                youtubeId: videoId,
                source: 'youtube',
                title: cleanTitle,
                artist: channel,
                album: 'Single Master',
                coverUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
                duration: durationSec,
                genre: 'Trending',
                bitrate: 'YouTube HQ Stream',
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
        console.warn('JSON parsing error:', err);
      }
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('YouTube search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}

