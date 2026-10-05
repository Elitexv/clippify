import { NextRequest, NextResponse } from "next/server";

// Web-only route — see scripts/build-mobile.mjs.
// Instagram's long-lived tokens don't use a separate refresh_token grant like the
// other platforms — you refresh the access token itself (must happen before it
// expires), and get back a new 60-day token to store in its place.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const accessToken = body?.accessToken;
  if (typeof accessToken !== "string" || !accessToken) {
    return NextResponse.json({ error: "Missing accessToken." }, { status: 400 });
  }

  const refreshUrl = new URL("https://graph.instagram.com/refresh_access_token");
  refreshUrl.searchParams.set("grant_type", "ig_refresh_token");
  refreshUrl.searchParams.set("access_token", accessToken);

  const res = await fetch(refreshUrl);
  const data = await res.json();

  if (!data.access_token) {
    return NextResponse.json({ error: data.error?.message || "Couldn't refresh the Instagram connection." }, { status: 401 });
  }

  return NextResponse.json({
    accessToken: data.access_token as string,
    expiresIn: (data.expires_in as number) ?? 5184000,
  });
}
