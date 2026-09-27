import { NextRequest, NextResponse } from "next/server";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
// Same "refresh the access token itself" pattern as Instagram — see
// src/app/api/instagram/refresh/route.ts.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const accessToken = body?.accessToken;
  if (typeof accessToken !== "string" || !accessToken) {
    return NextResponse.json({ error: "Missing accessToken." }, { status: 400 });
  }

  const refreshUrl = new URL("https://graph.threads.com/refresh_access_token");
  refreshUrl.searchParams.set("grant_type", "th_refresh_token");
  refreshUrl.searchParams.set("access_token", accessToken);

  const res = await fetch(refreshUrl);
  const data = await res.json();

  if (!data.access_token) {
    return NextResponse.json({ error: data.error?.message || "Couldn't refresh the Threads connection." }, { status: 401 });
  }

  return NextResponse.json({
    accessToken: data.access_token as string,
    expiresIn: (data.expires_in as number) ?? 5184000,
  });
}
