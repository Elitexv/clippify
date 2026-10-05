import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

// Web-only route — see scripts/build-mobile.mjs.
const STATE_COOKIE = "instagram_oauth_state";
// Basic profile only — no posting/messaging permissions requested.
const SCOPE = "instagram_business_basic";

export async function GET() {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Instagram isn't configured yet. Set INSTAGRAM_CLIENT_ID and INSTAGRAM_REDIRECT_URI." },
      { status: 500 },
    );
  }

  const state = randomUUID();

  const authorizeUrl = new URL("https://www.instagram.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", SCOPE);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
