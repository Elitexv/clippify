import { NextRequest } from "next/server";
import { socialErrorRedirect, socialSuccessRedirect } from "@/app/api/_lib/social-oauth";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
const STATE_COOKIE = "reddit_oauth_state";
// Reddit requires every API call (including the token exchange) to send a
// descriptive, unique User-Agent or it aggressively rate-limits/blocks the request —
// see https://github.com/reddit-archive/reddit/wiki/API.
const USER_AGENT = "web:com.clippifi.app:v1.0 (by /u/clippifi)";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (oauthError) {
    return socialErrorRedirect(origin, "reddit", oauthError);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return socialErrorRedirect(origin, "reddit", "Couldn't verify the Reddit sign-in request. Please try again.");
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const redirectUri = process.env.REDDIT_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return socialErrorRedirect(origin, "reddit", "Reddit isn't configured on the server yet.");
  }

  let tokenData: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
  };

  try {
    const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    tokenData = await tokenRes.json();
  } catch {
    const response = socialErrorRedirect(origin, "reddit", "Couldn't reach Reddit. Please try again.");
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  if (!tokenData.access_token) {
    const response = socialErrorRedirect(origin, "reddit", tokenData.error || "Reddit didn't return a valid connection.");
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  // Best-effort username — cosmetic only, connection still succeeds without it.
  let handle = "";
  try {
    const meRes = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": USER_AGENT },
    });
    const me = await meRes.json();
    handle = me?.name ? `u/${me.name}` : "";
  } catch {
    // Non-fatal.
  }

  const response = socialSuccessRedirect(origin, "reddit", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    handle,
  });
  response.cookies.delete(STATE_COOKIE);
  return response;
}
