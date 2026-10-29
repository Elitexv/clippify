import { NextResponse } from "next/server";

// Separate from social-oauth.ts's generic connect-flow helper on purpose: "sign in
// with TikTok" (src/app/api/tiktok/{authorize,callback}, intent=login) replaces the
// whole Clippifi sign-in, not just a Creator Settings account link, so it hands back a
// Firebase custom token instead of raw TikTok tokens, and always returns to /login
// instead of /dashboard/creator-settings. Same fragment-not-query-string rule as the
// generic helper — never reaches server logs — read once in LoginForm.tsx and
// immediately scrubbed via history.replaceState.
const LOGIN_RETURN_PATH = "/login";

export function tiktokLoginErrorRedirect(origin: string, message: string) {
  const url = new URL(LOGIN_RETURN_PATH, origin);
  url.hash = `tiktok_login_error=${encodeURIComponent(message)}`;
  return NextResponse.redirect(url);
}

export function tiktokLoginSuccessRedirect(origin: string, params: { customToken: string; role: string }) {
  const url = new URL(LOGIN_RETURN_PATH, origin);
  const search = new URLSearchParams({
    tiktok_login_token: params.customToken,
    tiktok_login_role: params.role,
  });
  url.hash = search.toString();
  return NextResponse.redirect(url);
}
