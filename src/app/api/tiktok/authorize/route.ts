import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

// Web-only route (see scripts/build-mobile.mjs, which excludes src/app/api entirely
// from the mobile static export build — Next's `output: "export"` can't support
// dynamic route handlers like this one, and TikTok OAuth is inherently dynamic).

const STATE_COOKIE = "tiktok_oauth_state";
const SCOPES = "user.info.basic,video.list";

// TikTok's authorize redirect_uri must be a static, exact-match HTTPS URL registered
// in the TikTok developer portal — no query params, no fragments, no localhost. See
// TIKTOK_REDIRECT_URI in env; this same value is reused verbatim in the token exchange.
export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !redirectUri) {
    return NextResponse.json(
      { error: "TikTok isn't configured yet. Set TIKTOK_CLIENT_KEY and TIKTOK_REDIRECT_URI." },
      { status: 500 },
    );
  }

  const state = randomUUID();

  const authorizeUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authorizeUrl.searchParams.set("client_key", clientKey);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", SCOPES);
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
