import { NextRequest, NextResponse } from "next/server";
import { socialErrorRedirect, socialSuccessRedirect } from "@/app/api/_lib/social-oauth";
import { tiktokLoginErrorRedirect, tiktokLoginSuccessRedirect } from "@/app/api/_lib/tiktok-login";
import { adminAuth } from "@/app/api/_lib/firebase-admin";

// Web-only route — see scripts/build-mobile.mjs.
const STATE_COOKIE = "tiktok_oauth_state";
const INTENT_COOKIE = "tiktok_oauth_intent";
const ROLE_COOKIE = "tiktok_oauth_role";

function clearCookies(response: NextResponse) {
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(INTENT_COOKIE);
  response.cookies.delete(ROLE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const isLogin = request.cookies.get(INTENT_COOKIE)?.value === "login";
  const role = request.cookies.get(ROLE_COOKIE)?.value === "brand" ? "brand" : "creator";

  const errorRedirect = (message: string) =>
    isLogin ? tiktokLoginErrorRedirect(origin, message) : socialErrorRedirect(origin, "tiktok", message);

  if (oauthError) {
    return clearCookies(errorRedirect(searchParams.get("error_description") || oauthError));
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return clearCookies(errorRedirect("Couldn't verify the TikTok sign-in request. Please try again."));
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey || !clientSecret || !redirectUri) {
    return clearCookies(errorRedirect("TikTok isn't configured on the server yet."));
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
    return clearCookies(errorRedirect("Couldn't reach TikTok. Please try again."));
  }

  if (!tokenData.access_token) {
    return clearCookies(errorRedirect(tokenData.error_description || tokenData.error || "TikTok didn't return a valid connection."));
  }

  // Best-effort display name — cosmetic for the connect flow, used as the new
  // account's display name for the login flow. Either way, non-fatal if it fails.
  let displayName = "";
  try {
    const meRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const me = await meRes.json();
    displayName = me?.data?.user?.display_name ?? "";
  } catch {
    // Non-fatal.
  }

  if (!isLogin) {
    return clearCookies(
      socialSuccessRedirect(origin, "tiktok", {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        handle: displayName,
      }),
    );
  }

  // "Continue with TikTok" on login/signup — not an account-link, a full Clippifi
  // sign-in. TikTok has no OIDC id_token and isn't a Firebase-native provider, so this
  // mints our own Firebase custom token for a uid keyed off TikTok's open_id (stable
  // per TikTok account) and hands it to the client, which signs in with it exactly
  // like the one Flutterwave-style disposable-test-user scripts in this repo already
  // use signInWithCustomToken for. createCustomToken() implicitly creates the
  // underlying Auth user on first use — but only with an empty profile, so this
  // explicitly creates it first (when it doesn't already exist) purely to set
  // displayName, which the existing client-side ensureUserProfile() self-heal reads
  // from firebaseUser.displayName the same way it already does for Google/Apple.
  //
  // Note: TikTok's Login Kit never provides an email address — a TikTok-only account
  // has none until the user supplies one (gated at the one place it's actually needed:
  // campaign checkout, see src/app/dashboard/post-job/page.tsx).
  if (!tokenData.open_id) {
    return clearCookies(errorRedirect("TikTok didn't return an account identifier. Please try again."));
  }
  const uid = `tiktok:${tokenData.open_id}`;

  try {
    const auth = adminAuth();
    const exists = await auth
      .getUser(uid)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      await auth.createUser({ uid, displayName: displayName || "TikTok Creator" });
    }
    const customToken = await auth.createCustomToken(uid);
    return clearCookies(tiktokLoginSuccessRedirect(origin, { customToken, role }));
  } catch (error) {
    console.error("TikTok login custom-token mint failed:", error);
    return clearCookies(errorRedirect("Couldn't complete TikTok sign-in. Please try again."));
  }
}
