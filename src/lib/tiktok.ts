// TikTok video stats via TikAPI (https://tikapi.io, an unofficial TikTok API) —
// src/app/api/tiktok/video-stats/route.ts holds the API key server-side. Works for any
// public video by ID or share link alone, no connect step needed (TikAPI's own
// OAuth-style "Connect" product 404s as of 2026-10-15, and even if it worked, isn't
// needed for this — the same trust model as the YouTube Data API lookup in
// src/lib/youtube.ts).
//
// Separately, as of 2026-10-29, a creator can connect their real TikTok account via
// the official Login Kit OAuth flow (src/app/api/tiktok/{authorize,callback,refresh},
// src/lib/socials.ts) — see fetchMyTikTokVideos below. That's a different, unrelated
// capability: official Display API video details for the creator's *own* videos,
// which this file's public-link lookup above can't provide (TikAPI has no way to tell
// us "these are your videos").

const TIKTOK_URL_PATTERN = /tiktok\.com\/(?:@[\w.-]+\/video|v)\/(\d+)/;

export function extractTikTokVideoId(url: string): string | null {
  const match = url.match(TIKTOK_URL_PATTERN);
  return match ? match[1] : null;
}

// TikTok's "Share" button — the way most creators actually copy their own video
// link — gives out a short redirect (vm.tiktok.com/…, vt.tiktok.com/…, or
// tiktok.com/t/…) with no video ID in it. Unlike a canonical URL, TikAPI accepts
// these directly and resolves them server-side (confirmed empirically — a canonical
// www.tiktok.com/@user/video/<id> URL is rejected as invalid, but a short link
// produces a distinct "failed parsing short link" error instead of "missing field",
// meaning TikAPI genuinely attempts to resolve it).
//
// Regex rather than `new URL()` on purpose, matching TIKTOK_URL_PATTERN's style: a
// creator can paste a link without a scheme (e.g. "tiktok.com/@user/video/123") and
// `new URL()` would throw on that, silently breaking matching.
const TIKTOK_SHORT_LINK_PATTERN = /(?:^|\/\/)(?:vm|vt)\.tiktok\.com\/|tiktok\.com\/t\//;

function isTikTokShortLink(url: string): boolean {
  return TIKTOK_SHORT_LINK_PATTERN.test(url);
}

/** Any recognizable TikTok link (full video URL or short share link), used to decide when to show TikTok-specific hints in the submit form. */
export function isTikTokLink(url: string): boolean {
  return /(?:^|\.|\/\/)tiktok\.com\//.test(url);
}

export type TikTokVideoStats = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number | null;
};

/**
 * Fetches view/like counts for a TikTok link a creator pastes. Works for any public
 * video, not just ones on a "connected" account — see the file comment above for why
 * there's no connect step. Returns null for a non-TikTok link, one TikAPI can't
 * resolve, or on network failure.
 */
export async function fetchTikTokVideoStats(url: string): Promise<TikTokVideoStats | null> {
  const id = extractTikTokVideoId(url) ?? (isTikTokShortLink(url) ? url : null);
  if (!id) return null;

  try {
    const res = await fetch("/api/tiktok/video-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return null;
    return (await res.json()) as TikTokVideoStats;
  } catch {
    return null;
  }
}

export type MyTikTokVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  shareUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: number;
};

/**
 * Lists the connected creator's own TikTok videos via the official Display API
 * (src/app/api/tiktok/videos), used by TikTokVideoPicker. Unlike fetchTikTokVideoStats
 * above, this needs a real OAuth access token — see getValidSocialAccessToken in
 * src/lib/socials.ts — and only returns the token's own account's videos.
 */
export async function fetchMyTikTokVideos(
  accessToken: string,
  cursor?: number,
): Promise<{ videos: MyTikTokVideo[]; cursor: number; hasMore: boolean } | null> {
  try {
    const res = await fetch("/api/tiktok/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, ...(cursor ? { cursor } : {}) }),
    });
    if (!res.ok) return null;
    return (await res.json()) as { videos: MyTikTokVideo[]; cursor: number; hasMore: boolean };
  } catch {
    return null;
  }
}
