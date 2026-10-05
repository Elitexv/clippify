import { NextRequest, NextResponse } from "next/server";

// Web-only route — see scripts/build-mobile.mjs.
export async function POST(request: NextRequest) {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "X isn't configured on the server yet." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const refreshToken = body?.refreshToken;
  if (typeof refreshToken !== "string" || !refreshToken) {
    return NextResponse.json({ error: "Missing refreshToken." }, { status: 400 });
  }

  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await tokenRes.json();

  if (!data.access_token) {
    return NextResponse.json(
      { error: data.error_description || data.error || "Couldn't refresh the X connection." },
      { status: 401 },
    );
  }

  // X rotates the refresh token on every use — the caller must persist this new one.
  return NextResponse.json({
    accessToken: data.access_token as string,
    refreshToken: (data.refresh_token as string) ?? refreshToken,
    expiresIn: (data.expires_in as number) ?? 7200,
  });
}
