import { NextRequest, NextResponse } from "next/server";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
// TikTok's video/query endpoint only resolves video IDs belonging to whichever
// account authorized the access token — it's not a public lookup of any tiktok.com
// link, only videos the connected creator posted themselves.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const accessToken = body?.accessToken;
  const videoId = body?.videoId;
  if (typeof accessToken !== "string" || !accessToken || typeof videoId !== "string" || !videoId) {
    return NextResponse.json({ error: "Missing accessToken or videoId." }, { status: 400 });
  }

  const fields = "id,title,cover_image_url,view_count,like_count";
  const res = await fetch(`https://open.tiktokapis.com/v2/video/query/?fields=${fields}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filters: { video_ids: [videoId] } }),
  });
  const data = await res.json();

  if (data.error && data.error.code !== "ok") {
    const status = data.error.code === "access_token_invalid" ? 401 : 502;
    return NextResponse.json({ error: data.error.message || "TikTok request failed." }, { status });
  }

  const video = data.data?.videos?.[0];
  if (!video) {
    return NextResponse.json({ error: "That video isn't on your connected TikTok account." }, { status: 404 });
  }

  return NextResponse.json({
    videoId: video.id as string,
    title: (video.title as string) ?? "",
    thumbnailUrl: (video.cover_image_url as string) ?? "",
    viewCount: Number(video.view_count ?? 0),
    likeCount: video.like_count != null ? Number(video.like_count) : null,
  });
}
