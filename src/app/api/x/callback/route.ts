import { NextRequest } from "next/server";
import { socialErrorRedirect, socialSuccessRedirect } from "@/app/api/_lib/social-oauth";

// Web-only route — see scripts/build-mobile.mjs.
const STATE_COOKIE = "x_oauth_state";
const VERIFIER_COOKIE = "x_oauth_verifier";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(VERIFIER_COOKIE)?.value;

  if (oauthError) {
    return socialErrorRedirect(origin, "x", oauthError);
  }
  if (!code || !state || !expectedState || state !== expectedState || !codeVerifier) {
    return socialErrorRedirect(origin, "x", "Couldn't verify the X sign-in request. Please try again.");
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const redirectUri = process.env.X_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return socialErrorRedirect(origin, "x", "X isn't configured on the server yet.");
  }

  let tokenData: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  try {
    const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });
    tokenData = await tokenRes.json();
  } catch {
    const response = socialErrorRedirect(origin, "x", "Couldn't reach X. Please try again.");
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(VERIFIER_COOKIE);
    return response;
  }

  if (!tokenData.access_token) {
    const response = socialErrorRedirect(origin, "x", tokenData.error_description || tokenData.error || "X didn't return a valid connection.");
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(VERIFIER_COOKIE);
    return response;
  }

  // Best-effort handle — cosmetic only, connection still succeeds without it.
  let handle = "";
  try {
    const meRes = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const me = await meRes.json();
    handle = me?.data?.username ? `@${me.data.username}` : "";
  } catch {
    // Non-fatal.
  }

  const response = socialSuccessRedirect(origin, "x", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    handle,
  });
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(VERIFIER_COOKIE);
  return response;
}
