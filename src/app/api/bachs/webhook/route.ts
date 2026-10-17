import { NextRequest, NextResponse } from "next/server";
import { activatePaidCampaign } from "@/app/api/_lib/campaign-checkout";
import { verifyBachsSignature } from "@/app/api/_lib/bachs";

// Web-only route — see scripts/build-mobile.mjs.
// Bachs' source of truth for "this campaign is paid". Nothing here trusts the browser:
// the signature is checked against the raw body, and activatePaidCampaign() only
// flips the campaign live when the reference, checkout id, currency, and amount all
// match what was recorded at checkout creation. Events are deduplicated by id, since
// Bachs may redeliver.
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

  const result = await activatePaidCampaign({
    eventsCollection: "bachsEvents",
    eventId: event.id,
    reference: event.data.reference,
    paymentReference: event.data.checkout_id,
    currency: event.data.currency,
    amount: Number(event.data.amount),
    provider: "bachs",
  });
  if (!result.matched && !result.duplicate) {
    console.error("Bachs checkout.completed didn't match a payable campaign:", event.id, event.data.reference);
  }

  return NextResponse.json({ received: true, ...result });
}
