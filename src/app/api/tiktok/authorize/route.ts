import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { socialErrorRedirect } from "@/app/api/_lib/social-oauth";

// Web-only route — see scripts/build-mobile.mjs.
const STATE_COOKIE = "tiktok_oauth_state";
// user.info.basic gets a display name for the "Connected as ..." UI; video.list is
// what powers fetching the creator's own video details (src/app/api/tiktok/videos).
const SCOPES = "user.info.basic,video.list";

export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !redirectUri) {
    // See src/app/api/reddit/authorize/route.ts for why this redirects instead of
    // returning JSON — reached via a full-page navigation, not a fetch().
    return socialErrorRedirect(request.nextUrl.origin, "tiktok", "TikTok isn't configured yet. Ask an admin to finish setting it up.");
  }

  const state = randomUUID();

  // Unlike X, TikTok's web (confidential-client) flow doesn't require PKCE — only
  // mobile/desktop apps do (confirmed against TikTok's own OAuth docs, not assumed).
  const authorizeUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authorizeUrl.searchParams.set("client_key", clientKey);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", SCOPES);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}
