import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only. Bachs' live API base; the secret key never leaves the server.
const BACHS_API = "https://api.bachs.io/v1";
const SIGNATURE_TOLERANCE_SECONDS = 300;

export type BachsCheckout = { checkout_id: string; checkout_url: string };

export async function createBachsCheckout({
  amount,
  reference,
  metadata,
  successUrl,
  cancelUrl,
}: {
  amount: string;
  reference: string;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}): Promise<BachsCheckout> {
  const secret = process.env.BACHS_SECRET_KEY;
  if (!secret) throw new Error("BACHS_SECRET_KEY isn't set.");

  const res = await fetch(`${BACHS_API}/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pricing: { currency: "NGN", amount },
      reference,
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_creation: "if_required",
      expires_in_minutes: 60,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.checkout_id || !data.checkout_url) {
    throw new Error(data.detail || "Bachs didn't return a checkout.");
  }
  return { checkout_id: data.checkout_id as string, checkout_url: data.checkout_url as string };
}

/**
 * Verifies a Bachs webhook using X-Bachs-Signature-V2 ("t=<unix>,v1=<hex>"), where the
 * signature is HMAC-SHA256 over "<t>.<raw body>". Rejects stale deliveries outside the
 * tolerance window to block replays. Must be called with the raw, unparsed body.
 */
export function verifyBachsSignature(rawBody: string, header: string | null, secret: string, nowSeconds = Date.now() / 1000): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const idx = part.indexOf("=");
      return [part.slice(0, idx).trim(), part.slice(idx + 1).trim()];
    }),
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!Number.isFinite(timestamp) || !signature) return false;
  if (Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
