import { NextRequest, NextResponse } from "next/server";

// Web-only route — see scripts/build-mobile.mjs.
// Thin proxy to TikAPI (https://tikapi.io, an unofficial TikTok API) so the API key
// never reaches the browser. No creator "connect" step exists or is needed here —
// unlike TikTok's own official API (removed, see commit cfa9c32), TikAPI can look up
// any public video's stats by ID or share link alone, the same trust model as the
// YouTube Data API lookup in src/lib/youtube.ts.
export async function POST(request: NextRequest) {
  const apiKey = process.env.TIKAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TikTok stats aren't configured on the server yet." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  let data: {
    status?: string;
    message?: string;
    itemInfo?: { itemStruct?: { id?: string; desc?: string; stats?: { playCount?: number; diggCount?: number }; video?: { cover?: string } } };
  };
  try {
    const url = new URL("https://api.tikapi.io/public/video");
    url.searchParams.set("id", id);
    const res = await fetch(url, { headers: { "X-API-KEY": apiKey } });
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Couldn't reach TikTok. Please try again." }, { status: 502 });
  }

  const item = data.itemInfo?.itemStruct;
  if (data.status !== "success" || !item) {
    return NextResponse.json({ error: data.message || "That TikTok video couldn't be found." }, { status: 404 });
  }

  return NextResponse.json({
    videoId: item.id ?? id,
    title: item.desc ?? "",
    thumbnailUrl: item.video?.cover ?? "",
    viewCount: item.stats?.playCount ?? 0,
    likeCount: item.stats?.diggCount ?? null,
  });
}
