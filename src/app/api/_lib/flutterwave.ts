import { timingSafeEqual } from "node:crypto";
import { adminDb } from "@/app/api/_lib/firebase-admin";

// Server-only. Unlike Bachs (env vars), Flutterwave's keys are admin-configured
// through Manage Payments (src/app/admin/manage-payments/page.tsx) and live in the
// settings/platform Firestore doc — same place the admin already fills in Paystack's
// keys. Read here with Admin credentials since that doc is admin-only per
// firestore.rules.
async function getFlutterwaveKeys(): Promise<{ secretKey: string; webhookSecretHash: string } | null> {
  const snap = await adminDb().collection("settings").doc("platform").get();
  const config = snap.data()?.paymentProviders?.flutterwave;
  const secretKey = config?.keys?.secretKey;
  const webhookSecretHash = config?.keys?.webhookSecretHash;
  if (!config?.enabled || !secretKey) return null;
  return { secretKey, webhookSecretHash: webhookSecretHash ?? "" };
}

export type FlutterwaveCheckout = { link: string };

export async function createFlutterwaveCheckout({
  amount,
  reference,
  customerEmail,
  customerName,
  title,
  successUrl,
}: {
  amount: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  title: string;
  successUrl: string;
}): Promise<FlutterwaveCheckout> {
  const keys = await getFlutterwaveKeys();
  if (!keys) throw new Error("Flutterwave isn't configured yet. Ask an admin to check Manage Payments.");

  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keys.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: reference,
      amount,
      currency: "NGN",
      redirect_url: successUrl,
      customer: { email: customerEmail, name: customerName },
      customizations: { title },
      // Without this, Flutterwave falls back to every method enabled in the
      // dashboard's business settings (which is how PayPal was showing up on an
      // NGN checkout). Pin it to the methods we actually support.
      payment_options: "card,account,banktransfer,ussd",
    }),
  });
  const data = await res.json();
  if (data.status !== "success" || !data.data?.link) {
    throw new Error(data.message || "Flutterwave didn't return a checkout link.");
  }
  return { link: data.data.link as string };
}

/**
 * Verifies a Flutterwave webhook. Unlike Bachs' HMAC signature, Flutterwave's
 * "verif-hash" header is a plain shared secret — the exact string the admin set as
 * the webhook's secret hash — compared directly (constant-time) rather than computed
 * from the payload. Returns false (never throws) on any mismatch, including a missing
 * header or a configured secret of a different length.
 */
export async function verifyFlutterwaveWebhook(header: string | null): Promise<boolean> {
  if (!header) return false;
  const keys = await getFlutterwaveKeys();
  if (!keys?.webhookSecretHash) return false;

  const a = Buffer.from(header);
  const b = Buffer.from(keys.webhookSecretHash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type FlutterwaveVerifiedTransaction = {
  id: number;
  txRef: string;
  status: string;
  amount: number;
  currency: string;
};

/**
 * Looks a transaction up by our own tx_ref (== the campaign id) instead of waiting on
 * the webhook — see /api/flutterwave/verify. A real production gap proved this
 * necessary: Flutterwave's dashboard webhook delivery is an external configuration
 * step nothing in this codebase can guarantee is set up correctly, and when it isn't,
 * a campaign a brand genuinely paid for stays stuck on "awaiting_payment" forever with
 * no recourse. This calls Flutterwave directly with our own secret key, so it doesn't
 * depend on that configuration at all. Returns null on any failure (not found,
 * network error, Flutterwave not configured) rather than throwing — callers treat
 * "couldn't verify" and "verified as unpaid" the same way, by leaving the campaign
 * exactly as it was.
 */
export async function verifyFlutterwaveReference(txRef: string): Promise<FlutterwaveVerifiedTransaction | null> {
  const keys = await getFlutterwaveKeys();
  if (!keys) return null;

  try {
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
      { headers: { Authorization: `Bearer ${keys.secretKey}` } },
    );
    const result = await res.json();
    const tx = result?.data;
    if (result?.status !== "success" || !tx) return null;
    return { id: tx.id, txRef: tx.tx_ref, status: tx.status, amount: tx.amount, currency: tx.currency };
  } catch {
    return null;
  }
}
