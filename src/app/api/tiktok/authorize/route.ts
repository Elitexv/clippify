import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { socialErrorRedirect } from "@/app/api/_lib/social-oauth";
import { tiktokLoginErrorRedirect } from "@/app/api/_lib/tiktok-login";

// Web-only route — see scripts/build-mobile.mjs.
const STATE_COOKIE = "tiktok_oauth_state";
// Set only when ?intent=login — read back by the callback to decide which of the two
// very different things this authorize call is for: linking an existing Clippifi
// account's TikTok connection (default, used by Creator Settings), or signing in to
// Clippifi itself with TikTok (used by the login/signup pages' "Continue with TikTok").
// A cookie rather than threading it through TikTok's own redirect_uri, because that
// URI has to be a static, pre-registered string with no query string at all.
const INTENT_COOKIE = "tiktok_oauth_intent";
const ROLE_COOKIE = "tiktok_oauth_role";
// user.info.basic gets a display name for the "Connected as ..." UI (or the new
// Firebase account's display name, for intent=login); video.list is what powers
// fetching the creator's own video details (src/app/api/tiktok/videos).
const SCOPES = "user.info.basic,video.list";

export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  const intent = request.nextUrl.searchParams.get("intent") === "login" ? "login" : "connect";
  const requestedRole = request.nextUrl.searchParams.get("role");
  const role = requestedRole === "brand" ? "brand" : "creator";

  if (!clientKey || !redirectUri) {
    // See src/app/api/reddit/authorize/route.ts for why this redirects instead of
    // returning JSON — reached via a full-page navigation, not a fetch().
    return intent === "login"
      ? tiktokLoginErrorRedirect(request.nextUrl.origin, "TikTok isn't configured yet. Ask an admin to finish setting it up.")
      : socialErrorRedirect(request.nextUrl.origin, "tiktok", "TikTok isn't configured yet. Ask an admin to finish setting it up.");
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
  const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 600, path: "/" };
  response.cookies.set(STATE_COOKIE, state, cookieOpts);
  if (intent === "login") {
    response.cookies.set(INTENT_COOKIE, "login", cookieOpts);
    response.cookies.set(ROLE_COOKIE, role, cookieOpts);
  }
  return response;
}
