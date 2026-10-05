import { NextResponse } from "next/server";

// Shared by every social platform's OAuth callback route (Reddit, X, Instagram,
// Threads — Bluesky's AT Protocol OAuth is structurally different and doesn't use
// this). Underscore-prefixed folder so Next's router ignores it as a route (see
// scripts/build-mobile.mjs for the sibling pattern this generalizes).
//
// Token hand-off happens via a URL fragment, never a query string — fragments never
// reach the server/logs. The one page that reads it (src/app/dashboard/creator-settings
// /page.tsx) parses window.location.hash once and immediately scrubs it with
// history.replaceState.
export const SOCIAL_RETURN_PATH = "/dashboard/creator-settings";

export function socialErrorRedirect(origin: string, platform: string, message: string) {
  const url = new URL(SOCIAL_RETURN_PATH, origin);
  url.hash = `${platform}_error=${encodeURIComponent(message)}`;
  return NextResponse.redirect(url);
}

export function socialSuccessRedirect(
  origin: string,
  platform: string,
  params: { accessToken: string; refreshToken?: string; expiresIn?: number; handle?: string },
) {
  const url = new URL(SOCIAL_RETURN_PATH, origin);
  const search = new URLSearchParams({
    [`${platform}_access_token`]: params.accessToken,
    [`${platform}_refresh_token`]: params.refreshToken ?? "",
    [`${platform}_expires_in`]: String(params.expiresIn ?? 0),
    [`${platform}_handle`]: params.handle ?? "",
  });
  url.hash = search.toString();
  return NextResponse.redirect(url);
}
