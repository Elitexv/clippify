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
