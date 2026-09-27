import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
const STATE_COOKIE = "threads_oauth_state";
const SCOPE = "threads_basic";

export async function GET() {
  const clientId = process.env.THREADS_CLIENT_ID;
  const redirectUri = process.env.THREADS_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Threads isn't configured yet. Set THREADS_CLIENT_ID and THREADS_REDIRECT_URI." },
      { status: 500 },
    );
  }

  const state = randomUUID();

  const authorizeUrl = new URL("https://threads.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", SCOPE);
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
