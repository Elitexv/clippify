import { NextRequest } from "next/server";
import { socialErrorRedirect, socialSuccessRedirect } from "@/app/api/_lib/social-oauth";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
const STATE_COOKIE = "threads_oauth_state";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (oauthError) {
    return socialErrorRedirect(origin, "threads", oauthError);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return socialErrorRedirect(origin, "threads", "Couldn't verify the Threads sign-in request. Please try again.");
  }

  const clientId = process.env.THREADS_CLIENT_ID;
  const clientSecret = process.env.THREADS_CLIENT_SECRET;
  const redirectUri = process.env.THREADS_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return socialErrorRedirect(origin, "threads", "Threads isn't configured on the server yet.");
  }

  let shortLivedToken: string;
  try {
    const tokenRes = await fetch("https://graph.threads.com/oauth/access_token", {
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
      const response = socialErrorRedirect(origin, "threads", data.error_message || "Threads didn't return a valid connection.");
      response.cookies.delete(STATE_COOKIE);
      return response;
    }
    shortLivedToken = data.access_token as string;
  } catch {
    const response = socialErrorRedirect(origin, "threads", "Couldn't reach Threads. Please try again.");
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  // Same short-lived → long-lived (60 day) exchange pattern as Instagram — both are
  // Meta Graph API products and share it.
  let longLivedToken: string;
  let expiresIn = 3600;
  try {
    const exchangeUrl = new URL("https://graph.threads.com/access_token");
    exchangeUrl.searchParams.set("grant_type", "th_exchange_token");
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
    const meRes = await fetch(`https://graph.threads.com/me?fields=username&access_token=${longLivedToken}`);
    const me = await meRes.json();
    handle = me?.username ? `@${me.username}` : "";
  } catch {
    // Non-fatal.
  }

  const response = socialSuccessRedirect(origin, "threads", {
    accessToken: longLivedToken,
    expiresIn,
    handle,
  });
  response.cookies.delete(STATE_COOKIE);
  return response;
}
