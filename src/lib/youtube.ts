// Pulls view/like counts for a YouTube link using the Data API v3. The API key is
// meant to be restricted by HTTP referrer in Google Cloud Console, which is what
// makes it safe to keep in the public-readable settings doc and call directly from
// the browser — see platform-settings.ts's `youtubeApiKey`.

const YOUTUBE_URL_PATTERN =
  /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_URL_PATTERN);
  return match ? match[1] : null;
}

export type YouTubeStats = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number | null;
};

export async function fetchYouTubeStats(videoId: string, apiKey: string): Promise<YouTubeStats | null> {
  const params = new URLSearchParams({
    part: "snippet,statistics",
    id: videoId,
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`);
  if (!res.ok) return null;

  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  const stats = item.statistics ?? {};
  const snippet = item.snippet ?? {};

  return {
    videoId,
    title: snippet.title ?? "",
    thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? "",
    viewCount: Number(stats.viewCount ?? 0),
    likeCount: stats.likeCount != null ? Number(stats.likeCount) : null,
  };
}
