import { NextRequest, NextResponse } from "next/server";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
const USER_AGENT = "web:com.clippifi.app:v1.0 (by /u/clippifi)";

export async function POST(request: NextRequest) {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Reddit isn't configured on the server yet." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const refreshToken = body?.refreshToken;
  if (typeof refreshToken !== "string" || !refreshToken) {
    return NextResponse.json({ error: "Missing refreshToken." }, { status: 400 });
  }

  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await tokenRes.json();

  if (!data.access_token) {
    return NextResponse.json({ error: data.error || "Couldn't refresh the Reddit connection." }, { status: 401 });
  }

  // Unlike TikTok, Reddit does not rotate the refresh token — the same one keeps
  // working, so the caller doesn't need to persist a new one.
  return NextResponse.json({
    accessToken: data.access_token as string,
    expiresIn: (data.expires_in as number) ?? 3600,
  });
}
