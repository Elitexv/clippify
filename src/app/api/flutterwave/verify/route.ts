import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/app/api/_lib/firebase-admin";
import { verifyFlutterwaveReference } from "@/app/api/_lib/flutterwave";
import { activatePaidCampaign } from "@/app/api/_lib/campaign-checkout";

// Web-only route — see scripts/build-mobile.mjs.
// Called by the brand's dashboard when it lands back on ?paid=<campaignId> after
// Flutterwave checkout, and from a manual "Check payment status" action on a campaign
// still stuck on awaiting_payment — see verifyFlutterwaveReference for why this exists
// instead of trusting the webhook alone. Shares the exact same activation logic the
// webhook uses (activatePaidCampaign), just reached from a different trigger.
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const campaignId = typeof body?.campaignId === "string" ? body.campaignId : "";
  if (!campaignId) return NextResponse.json({ error: "Missing campaignId." }, { status: 400 });

  const db = adminDb();
  const campaignRef = db.collection("campaigns").doc(campaignId);
  const campaignSnap = await campaignRef.get();
  const campaign = campaignSnap.data();
  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  const userSnap = await db.collection("users").doc(uid).get();
  const isOwner = campaign.brandId === uid;
  const isAdmin = userSnap.data()?.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "You don't have access to this campaign." }, { status: 403 });
  }

  if (campaign.status !== "awaiting_payment") {
    return NextResponse.json({ status: campaign.status, verified: campaign.status === "active" });
  }
  if (campaign.paymentProvider !== "flutterwave") {
    return NextResponse.json({ error: "This campaign wasn't paid for with Flutterwave." }, { status: 400 });
  }

  const tx = await verifyFlutterwaveReference(campaign.paymentReference);
  if (!tx || tx.status !== "successful") {
    return NextResponse.json({ status: "awaiting_payment", verified: false });
  }

  const result = await activatePaidCampaign({
    eventsCollection: "flutterwaveEvents",
    eventId: String(tx.id),
    reference: campaign.paymentReference,
    paymentReference: tx.txRef,
    currency: tx.currency,
    amount: tx.amount,
    provider: "flutterwave",
  });

  if (!result.matched) {
    // Either a duplicate (the webhook or a previous check already activated it — fine,
    // re-read below) or Flutterwave's own numbers didn't line up with what we expected.
    const after = await campaignRef.get();
    return NextResponse.json({ status: after.data()?.status ?? "awaiting_payment", verified: after.data()?.status === "active" });
  }

  return NextResponse.json({ status: "active", verified: true });
}
