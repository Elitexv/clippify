import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/app/api/_lib/firebase-admin";
import { verifyBachsSignature } from "@/app/api/_lib/bachs";

// Web-only route — see src/app/api/tiktok/authorize/route.ts.
// Bachs' source of truth for "this campaign is paid". Nothing here trusts the browser:
// the signature is checked against the raw body, and the campaign only goes live when
// the reference, checkout id, currency, and amount all match what we recorded at
// checkout creation. Events are deduplicated by id, since Bachs may redeliver.
export async function POST(request: NextRequest) {
  const secret = process.env.BACHS_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook isn't configured." }, { status: 500 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-bachs-signature-v2");
  if (!verifyBachsSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    id: string;
    type: string;
    data: { checkout_id?: string; reference?: string; amount?: string; currency?: string };
  };
  if (event.type !== "checkout.completed") {
    return NextResponse.json({ received: true });
  }

  const db = adminDb();
  const eventRef = db.collection("bachsEvents").doc(event.id);
  try {
    await eventRef.create({ type: event.type, receivedAt: FieldValue.serverTimestamp() });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const { checkout_id, reference, amount, currency } = event.data;
  const campaignRef = reference ? db.collection("campaigns").doc(reference) : null;
  const campaignSnap = campaignRef ? await campaignRef.get() : null;
  const campaign = campaignSnap?.data();

  const matches =
    !!campaign &&
    campaign.status === "awaiting_payment" &&
    campaign.paymentReference === checkout_id &&
    currency === "NGN" &&
    Number(amount) === campaign.amountDue;

  if (!campaignRef || !campaign || !matches) {
    console.error("Bachs checkout.completed didn't match a payable campaign:", event.id, reference);
    return NextResponse.json({ received: true, matched: false });
  }

  const batch = db.batch();
  batch.update(campaignRef, { status: "active", paidAt: FieldValue.serverTimestamp() });
  batch.set(db.collection("transactions").doc(), {
    type: "campaign",
    status: "success",
    userId: campaign.brandId,
    userName: campaign.brandName,
    amount: campaign.amountDue,
    provider: "bachs",
    reference: checkout_id,
    relatedTitle: campaign.title,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return NextResponse.json({ received: true, matched: true });
}
