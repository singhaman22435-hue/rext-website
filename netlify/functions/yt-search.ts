export async function handler(event: any) {
  const query = event.queryStringParameters?.q || '';
  const sanitizedQuery = (query || '')
    .replace(/[^\w\s\u0900-\u097F\u0A00-\u0A7F.,!?-]/gi, '')
    .trim()
    .substring(0, 80);

  if (!sanitizedQuery) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify([])
    };
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

    const html = await response.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    const results: any[] = [];

    if (match) {
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
              if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
              else if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
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
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(results)
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Search failed' })
    };
  }
}

