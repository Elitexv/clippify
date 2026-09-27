import { deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Shared storage for every social OAuth connection except TikTok, which already had
// its own users/{uid}/tiktok/connection doc before this existed (see src/lib/tiktok.ts)
// — left as-is rather than migrated, to avoid touching a working integration. Every
// platform added after TikTok stores its tokens the same shape, under
// users/{uid}/socials/{platform}, so the OAuth plumbing per platform only has to
// differ where the platforms actually differ (endpoints, token lifetimes).
export type SocialPlatform = "instagram" | "reddit" | "threads" | "x" | "bluesky";

export type SocialConnection = {
  handle: string;
  accessToken: string;
  refreshToken: string;
  // 0 means "doesn't expire / no refresh flow for this platform" (e.g. Bluesky's
  // session tokens are refreshed transparently by the atproto OAuth client instead).
  expiresAt: number;
  connectedAt: number;
};

function connectionDoc(uid: string, platform: SocialPlatform) {
  return doc(db, "users", uid, "socials", platform);
}

export async function saveSocialConnection(uid: string, platform: SocialPlatform, connection: SocialConnection) {
  await setDoc(connectionDoc(uid, platform), connection);
}

export async function getSocialConnection(uid: string, platform: SocialPlatform): Promise<SocialConnection | null> {
  const snap = await getDoc(connectionDoc(uid, platform));
  return snap.exists() ? (snap.data() as SocialConnection) : null;
}

export function subscribeToSocialConnections(uid: string, callback: (connections: Partial<Record<SocialPlatform, SocialConnection>>) => void) {
  const platforms: SocialPlatform[] = ["instagram", "reddit", "threads", "x", "bluesky"];
  const state: Partial<Record<SocialPlatform, SocialConnection>> = {};
  const unsubscribers = platforms.map((platform) =>
    onSnapshot(
      connectionDoc(uid, platform),
      (snap) => {
        if (snap.exists()) {
          state[platform] = snap.data() as SocialConnection;
        } else {
          delete state[platform];
        }
        callback({ ...state });
      },
      (error) => console.error(`${platform} connection listener error:`, error),
    ),
  );
  return () => unsubscribers.forEach((unsub) => unsub());
}

export async function disconnectSocial(uid: string, platform: SocialPlatform) {
  await deleteDoc(connectionDoc(uid, platform));
}

// Platforms whose long-lived token is refreshed by re-sending the access token itself
// (Meta's pattern — see src/app/api/instagram/refresh/route.ts) rather than a
// refresh_token grant.
const SELF_REFRESH_PLATFORMS: SocialPlatform[] = ["instagram", "threads"];

/**
 * Returns a usable access token for this creator's connected account on the given
 * platform, refreshing it first if it's expired or about to expire (mirrors
 * getValidTikTokAccessToken in src/lib/tiktok.ts, generalized across platforms since
 * they all share this same shape now). expiresAt of 0 means "never expires, nothing
 * to refresh." Returns null if there's no connection or the refresh itself fails.
 */
export async function getValidSocialAccessToken(uid: string, platform: SocialPlatform): Promise<string | null> {
  const connection = await getSocialConnection(uid, platform);
  if (!connection) return null;

  const expiresSoon = connection.expiresAt !== 0 && connection.expiresAt < Date.now() + 5 * 60 * 1000;
  if (!expiresSoon) return connection.accessToken;

  try {
    const body = SELF_REFRESH_PLATFORMS.includes(platform)
      ? { accessToken: connection.accessToken }
      : { refreshToken: connection.refreshToken };
    const res = await fetch(`/api/${platform}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();

    await saveSocialConnection(uid, platform, {
      ...connection,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? connection.refreshToken,
      expiresAt: data.expiresIn ? Date.now() + data.expiresIn * 1000 : 0,
    });
    return data.accessToken as string;
  } catch {
    return null;
  }
}
