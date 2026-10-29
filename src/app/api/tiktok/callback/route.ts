import { NextRequest } from "next/server";
import { socialErrorRedirect, socialSuccessRedirect } from "@/app/api/_lib/social-oauth";

// Web-only route — see scripts/build-mobile.mjs.
const STATE_COOKIE = "tiktok_oauth_state";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (oauthError) {
    const response = socialErrorRedirect(origin, "tiktok", searchParams.get("error_description") || oauthError);
    response.cookies.delete(STATE_COOKIE);
    return response;
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    const response = socialErrorRedirect(origin, "tiktok", "Couldn't verify the TikTok sign-in request. Please try again.");
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey || !clientSecret || !redirectUri) {
    return socialErrorRedirect(origin, "tiktok", "TikTok isn't configured on the server yet.");
  }

  let tokenData: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    tokenData = await tokenRes.json();
  } catch {
    const response = socialErrorRedirect(origin, "tiktok", "Couldn't reach TikTok. Please try again.");
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  if (!tokenData.access_token) {
    const response = socialErrorRedirect(
      origin,
      "tiktok",
      tokenData.error_description || tokenData.error || "TikTok didn't return a valid connection.",
    );
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  // Best-effort display name — cosmetic only, connection still succeeds without it.
  let handle = "";
  try {
    const meRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const me = await meRes.json();
    handle = me?.data?.user?.display_name ?? "";
  } catch {
    // Non-fatal.
  }

  const response = socialSuccessRedirect(origin, "tiktok", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    handle,
  });
  response.cookies.delete(STATE_COOKIE);
  return response;
}
