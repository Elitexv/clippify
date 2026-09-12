import { NextRequest, NextResponse } from "next/server";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
const STATE_COOKIE = "tiktok_oauth_state";
// Where to send the browser back to once the connection is stored — the only page
// that offers "Connect TikTok" today (see ProfileContent.tsx).
const RETURN_PATH = "/dashboard/account";

function redirectWithError(origin: string, message: string) {
  const url = new URL(RETURN_PATH, origin);
  url.hash = `tiktok_error=${encodeURIComponent(message)}`;
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (oauthError) {
    return redirectWithError(origin, oauthError);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithError(origin, "Couldn't verify the TikTok sign-in request. Please try again.");
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey || !clientSecret || !redirectUri) {
    return redirectWithError(origin, "TikTok isn't configured on the server yet.");
  }

  let tokenData: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    open_id?: string;
    error?: string;
    error_description?: string;
  };

  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
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
    const response = redirectWithError(origin, "Couldn't reach TikTok. Please try again.");
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  if (!tokenData.access_token || !tokenData.refresh_token || !tokenData.open_id) {
    const response = redirectWithError(
      origin,
      tokenData.error_description || tokenData.error || "TikTok didn't return a valid connection.",
    );
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  // Best-effort display name — cosmetic only, connection still succeeds without it.
  let displayName = "";
  try {
    const userRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=display_name",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    );
    const userData = await userRes.json();
    displayName = userData?.data?.user?.display_name ?? "";
  } catch {
    // Non-fatal — the connection still works without a display name.
  }

  const returnUrl = new URL(RETURN_PATH, origin);
  const params = new URLSearchParams({
    tiktok_access_token: tokenData.access_token,
    tiktok_refresh_token: tokenData.refresh_token,
    tiktok_expires_in: String(tokenData.expires_in ?? 86400),
    tiktok_open_id: tokenData.open_id,
    tiktok_display_name: displayName,
  });
  returnUrl.hash = params.toString();

  const response = NextResponse.redirect(returnUrl);
  response.cookies.delete(STATE_COOKIE);
  return response;
}
