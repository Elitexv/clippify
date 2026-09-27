import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

// Web-only route (see src/app/api/tiktok/authorize/route.ts for why — same
// mobile static-export conflict, same fix in scripts/build-mobile.mjs).

const STATE_COOKIE = "reddit_oauth_state";
const SCOPE = "identity";

export async function GET() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const redirectUri = process.env.REDDIT_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Reddit isn't configured yet. Set REDDIT_CLIENT_ID and REDDIT_REDIRECT_URI." },
      { status: 500 },
    );
  }

  const state = randomUUID();

  const authorizeUrl = new URL("https://www.reddit.com/api/v1/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  // "permanent" is required to get a refresh_token back at all — Reddit defaults to a
  // 1-hour token with no refresh_token otherwise.
  authorizeUrl.searchParams.set("duration", "permanent");
  authorizeUrl.searchParams.set("scope", SCOPE);

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
