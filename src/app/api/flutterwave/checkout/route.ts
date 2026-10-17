import { NextRequest, NextResponse } from "next/server";
import { createPendingCampaign } from "@/app/api/_lib/campaign-checkout";
import { createFlutterwaveCheckout } from "@/app/api/_lib/flutterwave";

// Web-only route — see scripts/build-mobile.mjs.
// Same shape as src/app/api/bachs/checkout/route.ts — creates the campaign as
// "awaiting_payment" and opens a Flutterwave Standard hosted checkout for the
// server-computed total. The campaign goes live only when the signed webhook
// confirms payment (src/app/api/flutterwave/webhook/route.ts).
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const pending = await createPendingCampaign(request, "flutterwave");
    if (!pending.ok) return pending.response;
    const { campaignRef, total, brandName, brandEmail } = pending.campaign;

    const origin = request.nextUrl.origin;
    try {
      const checkout = await createFlutterwaveCheckout({
        amount: total.toFixed(2),
        reference: campaignRef.id,
        customerEmail: brandEmail,
        customerName: brandName,
        title: "Clippifi campaign payment",
        successUrl: `${origin}/dashboard/campaigns?paid=${campaignRef.id}`,
      });
      await campaignRef.update({ paymentReference: campaignRef.id });
      return NextResponse.json({ checkoutUrl: checkout.link });
    } catch (error) {
      await campaignRef.delete();
      const message = error instanceof Error ? error.message : "Couldn't start checkout. Try again.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (error) {
    console.error("Flutterwave checkout failed:", error);
    const message = error instanceof Error ? error.message : "Couldn't start checkout. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
