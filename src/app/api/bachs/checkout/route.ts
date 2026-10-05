import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/app/api/_lib/firebase-admin";
import { createBachsCheckout } from "@/app/api/_lib/bachs";

// Web-only route — see scripts/build-mobile.mjs.
// Creates the campaign as "awaiting_payment" (invisible to creators — campaigns read
// rules only expose "active") and opens a Bachs checkout for the server-computed total.
// The campaign goes live only when the signed webhook confirms payment.
export async function POST(request: NextRequest) {
  try {
    return await handleCheckout(request);
  } catch (error) {
    console.error("Bachs checkout failed:", error);
    const message = error instanceof Error ? error.message : "Couldn't start checkout. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCheckout(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Sign in to post a campaign." }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  }

  const db = adminDb();
  const userSnap = await db.collection("users").doc(uid).get();
  const user = userSnap.data();
  if (!user || (user.role !== "brand" && user.role !== "both")) {
    return NextResponse.json({ error: "Only brand accounts can post campaigns." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const channelLink = typeof body?.channelLink === "string" ? body.channelLink.trim() : "";
  const brief = typeof body?.brief === "string" ? body.brief : "";
  const deadline = typeof body?.deadline === "string" ? body.deadline : "";
  const flyerUrl = typeof body?.flyerUrl === "string" ? body.flyerUrl : "";
  const budget = Number(body?.budget);
  if (!title || !channelLink || !Number.isFinite(budget) || budget <= 0) {
    return NextResponse.json({ error: "Fill in the campaign title, channel link, and budget." }, { status: 400 });
  }

  const settingsSnap = await db.collection("settings").doc("public").get();
  const settings = settingsSnap.data() ?? {};
  const feeRate = parseFloat(settings.campaignProcessingFee ?? "5") / 100;
  const minBudget = parseFloat(settings.minCampaignBudget ?? "1000");
  if (!Number.isFinite(feeRate) || budget < minBudget) {
    return NextResponse.json({ error: `Campaign budget must be at least ₦${minBudget}.` }, { status: 400 });
  }

  // Computed here, never trusted from the client — the webhook later checks the amount
  // Bachs actually collected against this exact figure.
  const total = Math.round((budget + budget * feeRate) * 100) / 100;

  const campaignRef = db.collection("campaigns").doc();
  await campaignRef.set({
    brandId: uid,
    brandName: user.name ?? "",
    title,
    channelLink,
    brief,
    budget,
    deadline,
    flyerUrl,
    status: "awaiting_payment",
    payoutPerClip: 0,
    amountDue: total,
    paymentProvider: "bachs",
    createdAt: FieldValue.serverTimestamp(),
  });

  const origin = request.nextUrl.origin;
  try {
    const checkout = await createBachsCheckout({
      amount: total.toFixed(2),
      reference: campaignRef.id,
      metadata: { campaign_id: campaignRef.id, brand_id: uid },
      successUrl: `${origin}/dashboard/campaigns?paid=${campaignRef.id}`,
      cancelUrl: `${origin}/dashboard/post-job?cancelled=1`,
    });
    await campaignRef.update({ paymentReference: checkout.checkout_id });
    return NextResponse.json({ checkoutUrl: checkout.checkout_url });
  } catch (error) {
    await campaignRef.delete();
    const message = error instanceof Error ? error.message : "Couldn't start checkout. Try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
