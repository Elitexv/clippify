import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { socialErrorRedirect } from "@/app/api/_lib/social-oauth";

// Web-only route (see scripts/build-mobile.mjs for why — same
// mobile static-export conflict, same fix in scripts/build-mobile.mjs).

const STATE_COOKIE = "reddit_oauth_state";
const SCOPE = "identity";

export async function GET(request: NextRequest) {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const redirectUri = process.env.REDDIT_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    // A plain NextResponse.json() here would land the browser on a raw JSON page —
    // this is reached via a full-page <a href> navigation (the "Connect" button),
    // not a fetch(), so the failure needs to redirect back into the app instead.
    return socialErrorRedirect(request.nextUrl.origin, "reddit", "Reddit isn't configured yet. Ask an admin to finish setting it up.");
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
