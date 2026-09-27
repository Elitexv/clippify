import { NextRequest } from "next/server";
import { socialErrorRedirect, socialSuccessRedirect } from "@/app/api/_lib/social-oauth";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
const STATE_COOKIE = "instagram_oauth_state";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (oauthError) {
    return socialErrorRedirect(origin, "instagram", oauthError);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return socialErrorRedirect(origin, "instagram", "Couldn't verify the Instagram sign-in request. Please try again.");
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return socialErrorRedirect(origin, "instagram", "Instagram isn't configured on the server yet.");
  }

  let shortLivedToken: string;
  try {
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    });
    const data = await tokenRes.json();
    if (!data.access_token) {
      const response = socialErrorRedirect(origin, "instagram", data.error_message || "Instagram didn't return a valid connection.");
      response.cookies.delete(STATE_COOKIE);
      return response;
    }
    shortLivedToken = data.access_token as string;
  } catch {
    const response = socialErrorRedirect(origin, "instagram", "Couldn't reach Instagram. Please try again.");
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  // Exchange the short-lived (1hr) token for a long-lived one (60 days) — the whole
  // point of doing this server-side is that it needs the app's client_secret.
  let longLivedToken: string;
  let expiresIn = 3600;
  try {
    const exchangeUrl = new URL("https://graph.instagram.com/access_token");
    exchangeUrl.searchParams.set("grant_type", "ig_exchange_token");
    exchangeUrl.searchParams.set("client_secret", clientSecret);
    exchangeUrl.searchParams.set("access_token", shortLivedToken);
    const exchangeRes = await fetch(exchangeUrl);
    const exchangeData = await exchangeRes.json();
    longLivedToken = exchangeData.access_token ?? shortLivedToken;
    expiresIn = exchangeData.expires_in ?? expiresIn;
  } catch {
    longLivedToken = shortLivedToken;
  }

  // Best-effort username — cosmetic only, connection still succeeds without it.
  let handle = "";
  try {
    const meRes = await fetch(`https://graph.instagram.com/me?fields=username&access_token=${longLivedToken}`);
    const me = await meRes.json();
    handle = me?.username ? `@${me.username}` : "";
  } catch {
    // Non-fatal.
  }

  const response = socialSuccessRedirect(origin, "instagram", {
    accessToken: longLivedToken,
    expiresIn,
    handle,
  });
  response.cookies.delete(STATE_COOKIE);
  return response;
}
