import { NextRequest, NextResponse } from "next/server";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
// TikTok's "Share" button (the way most creators actually copy their own video
// link) produces an opaque short redirect — vm.tiktok.com/…, vt.tiktok.com/…, or
// tiktok.com/t/… — that only resolves to the canonical .../video/<id> URL after
// following a redirect. Browsers can't read a cross-origin redirect's final URL
// (CORS), so this route follows it server-side and hands back where it landed.
// Host allowlist below also doubles as SSRF protection — only TikTok's own domains
// can ever be fetched here.
const ALLOWED_HOSTS = new Set(["vm.tiktok.com", "vt.tiktok.com", "www.tiktok.com", "tiktok.com", "m.tiktok.com"]);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const url = body?.url;
  if (typeof url !== "string" || !url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "Not a TikTok link." }, { status: 400 });
  }

  try {
    // HEAD avoids downloading the full page — the redirect chain is all we need.
    const res = await fetch(parsed.toString(), { method: "HEAD", redirect: "follow" });
    return NextResponse.json({ resolvedUrl: res.url });
  } catch (err) {
    console.error("tiktok resolve-link failed:", err);
    return NextResponse.json({ error: "Couldn't resolve that TikTok link." }, { status: 502 });
  }
}
