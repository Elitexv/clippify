import { NextRequest, NextResponse } from "next/server";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
export async function POST(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    return NextResponse.json({ error: "TikTok isn't configured on the server yet." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const refreshToken = body?.refreshToken;
  if (typeof refreshToken !== "string" || !refreshToken) {
    return NextResponse.json({ error: "Missing refreshToken." }, { status: 400 });
  }

  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await tokenRes.json();

  if (!data.access_token || !data.refresh_token) {
    return NextResponse.json(
      { error: data.error_description || data.error || "Couldn't refresh the TikTok connection." },
      { status: 401 },
    );
  }

  // TikTok rotates the refresh token on every use — the caller must persist this new
  // one, the old one stops working.
  return NextResponse.json({
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresIn: (data.expires_in as number) ?? 86400,
  });
}
