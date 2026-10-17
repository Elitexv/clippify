import { NextRequest, NextResponse } from "next/server";
import { activatePaidCampaign } from "@/app/api/_lib/campaign-checkout";
import { verifyFlutterwaveWebhook } from "@/app/api/_lib/flutterwave";

// Web-only route — see scripts/build-mobile.mjs.
// Same shape as src/app/api/bachs/webhook/route.ts. Flutterwave's "verif-hash" header
// is a plain shared secret (not a computed signature) — see verifyFlutterwaveWebhook.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const header = request.headers.get("verif-hash");
  if (!(await verifyFlutterwaveWebhook(header))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: { id: number; tx_ref: string; status: string; amount: number; currency: string };
  };
  if (event.event !== "charge.completed" || event.data.status !== "successful") {
    return NextResponse.json({ received: true });
  }

  const result = await activatePaidCampaign({
    eventsCollection: "flutterwaveEvents",
    eventId: String(event.data.id),
    reference: event.data.tx_ref,
    paymentReference: event.data.tx_ref,
    currency: event.data.currency,
    amount: event.data.amount,
    provider: "flutterwave",
  });
  if (!result.matched && !result.duplicate) {
    console.error("Flutterwave charge.completed didn't match a payable campaign:", event.data.id, event.data.tx_ref);
  }

  return NextResponse.json({ received: true, ...result });
}
