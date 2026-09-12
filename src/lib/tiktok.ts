import { deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type TikTokConnection = {
  openId: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  connectedAt: number;
};

function connectionDoc(uid: string) {
  return doc(db, "users", uid, "tiktok", "connection");
}

export async function saveTikTokConnection(uid: string, connection: TikTokConnection) {
  await setDoc(connectionDoc(uid), connection);
}

export async function getTikTokConnection(uid: string): Promise<TikTokConnection | null> {
  const snap = await getDoc(connectionDoc(uid));
  return snap.exists() ? (snap.data() as TikTokConnection) : null;
}

export function subscribeToTikTokConnection(uid: string, callback: (connection: TikTokConnection | null) => void) {
  return onSnapshot(
    connectionDoc(uid),
    (snap) => callback(snap.exists() ? (snap.data() as TikTokConnection) : null),
    (error) => {
      console.error("TikTok connection listener error:", error);
      callback(null);
    },
  );
}

export async function disconnectTikTok(uid: string) {
  await deleteDoc(connectionDoc(uid));
}

const TIKTOK_URL_PATTERN = /tiktok\.com\/(?:@[\w.-]+\/video|v)\/(\d+)/;

export function extractTikTokVideoId(url: string): string | null {
  const match = url.match(TIKTOK_URL_PATTERN);
  return match ? match[1] : null;
}

export type TikTokVideoStats = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number | null;
};

/**
 * Returns a usable access token for this creator's connected TikTok account,
 * refreshing it first if it's expired or about to expire. Refresh rotates the
 * refresh token too, so the caller's Firestore doc is updated either way. Returns
 * null if there's no connection or the refresh itself fails (e.g. it's been revoked).
 */
export async function getValidTikTokAccessToken(uid: string): Promise<string | null> {
  const connection = await getTikTokConnection(uid);
  if (!connection) return null;

  const expiresSoon = connection.expiresAt < Date.now() + 5 * 60 * 1000;
  if (!expiresSoon) return connection.accessToken;

  try {
    const res = await fetch("/api/tiktok/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: connection.refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();

    await saveTikTokConnection(uid, {
      ...connection,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresIn * 1000,
    });
    return data.accessToken as string;
  } catch {
    return null;
  }
}

export async function fetchTikTokVideoStats(accessToken: string, videoId: string): Promise<TikTokVideoStats | null> {
  try {
    const res = await fetch("/api/tiktok/video-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, videoId }),
    });
    if (!res.ok) return null;
    return (await res.json()) as TikTokVideoStats;
  } catch {
    return null;
  }
}
