import { NextResponse } from "next/server";
import { randomUUID, createHash, randomBytes } from "node:crypto";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
const STATE_COOKIE = "x_oauth_state";
const VERIFIER_COOKIE = "x_oauth_verifier";
// offline.access is what makes X hand back a refresh_token at all.
const SCOPES = "users.read tweet.read offline.access";

function base64url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function GET() {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.X_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "X isn't configured yet. Set X_CLIENT_ID and X_REDIRECT_URI." },
      { status: 500 },
    );
  }

  const state = randomUUID();
  // X's OAuth 2.0 requires PKCE even for confidential (server-secret-holding) clients.
  const codeVerifier = base64url(randomBytes(32));
  const codeChallenge = base64url(createHash("sha256").update(codeVerifier).digest());

  const authorizeUrl = new URL("https://x.com/i/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", SCOPES);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizeUrl);
  const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 600, path: "/" };
  response.cookies.set(STATE_COOKIE, state, cookieOpts);
  response.cookies.set(VERIFIER_COOKIE, codeVerifier, cookieOpts);
  return response;
}
