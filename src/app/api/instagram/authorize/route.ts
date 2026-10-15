import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { socialErrorRedirect } from "@/app/api/_lib/social-oauth";

// Web-only route — see scripts/build-mobile.mjs.
const STATE_COOKIE = "instagram_oauth_state";
// Basic profile only — no posting/messaging permissions requested.
const SCOPE = "instagram_business_basic";

export async function GET(request: NextRequest) {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    // See src/app/api/reddit/authorize/route.ts for why this redirects instead of
    // returning JSON — reached via a full-page navigation, not a fetch().
    return socialErrorRedirect(request.nextUrl.origin, "instagram", "Instagram isn't configured yet. Ask an admin to finish setting it up.");
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
