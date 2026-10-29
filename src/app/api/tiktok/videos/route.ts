import { NextRequest, NextResponse } from "next/server";

// Web-only route — see scripts/build-mobile.mjs.
// Proxies TikTok's Display API video.list for a creator's own connected account (see
// src/lib/tiktok.ts fetchMyTikTokVideos, used by TikTokVideoPicker). Takes the
// creator's own access token from the client (already refreshed via
// getValidSocialAccessToken) rather than looking it up server-side — this route has no
// Firebase Admin auth check of its own, same trust model as the other /api/tiktok
// routes, since the token itself is the only thing that lets TikTok's API return data.
const FIELDS = [
  "id",
  "cover_image_url",
  "share_url",
  "video_description",
  "title",
  "like_count",
  "comment_count",
  "share_count",
  "view_count",
  "create_time",
].join(",");

type TikTokVideoItem = {
  id: string;
  title?: string;
  video_description?: string;
  cover_image_url?: string;
  share_url?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
  create_time?: number;
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const accessToken = body?.accessToken;
  const cursor = typeof body?.cursor === "number" ? body.cursor : undefined;
  if (typeof accessToken !== "string" || !accessToken) {
    return NextResponse.json({ error: "Missing accessToken." }, { status: 400 });
  }

  const url = new URL("https://open.tiktokapis.com/v2/video/list/");
  url.searchParams.set("fields", FIELDS);

  let data: {
    data?: { videos?: TikTokVideoItem[]; cursor?: number; has_more?: boolean };
    error?: { code?: string; message?: string };
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }),
    });
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Couldn't reach TikTok." }, { status: 502 });
  }

  if (data.error?.code && data.error.code !== "ok") {
    return NextResponse.json({ error: data.error.message || "Couldn't fetch your TikTok videos." }, { status: 502 });
  }

  const videos = (data.data?.videos ?? []).map((v) => ({
    id: v.id,
    title: v.title || v.video_description || "",
    thumbnailUrl: v.cover_image_url ?? "",
    shareUrl: v.share_url ?? "",
    viewCount: v.view_count ?? 0,
    likeCount: v.like_count ?? 0,
    commentCount: v.comment_count ?? 0,
    shareCount: v.share_count ?? 0,
    createdAt: v.create_time ?? 0,
  }));

  return NextResponse.json({ videos, cursor: data.data?.cursor ?? 0, hasMore: !!data.data?.has_more });
}
