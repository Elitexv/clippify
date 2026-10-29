import { auth } from "@/lib/firebase";

// A plain `error?: string` on one shared shape doesn't narrow cleanly with `"error" in
// result` — both branches would still declare the key, just one as undefined — so this
// uses an explicit `ok` discriminant instead.
export type FlutterwaveVerifyResult =
  | { ok: true; status: string; verified: boolean }
  | { ok: false; error: string };

// Calls /api/flutterwave/verify — a direct check against Flutterwave's own records
// for a specific campaign, used as a fallback for when the dashboard webhook
// (src/app/api/flutterwave/webhook) doesn't fire. See that route and
// verifyFlutterwaveReference in src/app/api/_lib/flutterwave.ts for why this exists:
// Flutterwave's webhook delivery is an external dashboard setting nothing in this app
// can guarantee, so a campaign that was genuinely paid for could otherwise stay stuck
// on "awaiting_payment" forever with no way to recover short of a manual script.
export async function verifyFlutterwavePayment(campaignId: string): Promise<FlutterwaveVerifyResult> {
  if (!auth.currentUser) return { ok: false, error: "You're not signed in." };
  try {
    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch("/api/flutterwave/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ campaignId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || "Couldn't check payment status. Try again." };
    return { ok: true, status: data.status, verified: !!data.verified };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Try again." };
  }
}
