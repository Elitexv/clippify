import { NextRequest, NextResponse } from "next/server";
import { createPendingCampaign } from "@/app/api/_lib/campaign-checkout";
import { createBachsCheckout } from "@/app/api/_lib/bachs";

// Web-only route — see scripts/build-mobile.mjs.
// Creates the campaign as "awaiting_payment" (invisible to creators — campaigns read
// rules only expose "active") and opens a Bachs checkout for the server-computed total.
// The campaign goes live only when the signed webhook confirms payment.
// Cold-start Firebase Admin init plus the Firestore and Bachs calls can outlast the
// platform's default function timeout on a fresh instance.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const pending = await createPendingCampaign(request, "bachs");
    if (!pending.ok) return pending.response;
    const { campaignRef, total, uid } = pending.campaign;

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
  } catch (error) {
    console.error("Bachs checkout failed:", error);
    const message = error instanceof Error ? error.message : "Couldn't start checkout. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
