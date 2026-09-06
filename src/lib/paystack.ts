// Thin wrapper around Paystack's Inline JS popup (https://js.paystack.co/v1/inline.js).
// The "key" used here is the PUBLIC key, which is safe to ship to the browser — this
// mirrors how Paystack's own client-side integration guide works. For a real
// production deployment, the resulting reference should also be verified server-side
// against Paystack's secret key before treating the order as paid; this client-only
// flow is a reasonable scope for wiring up test-mode payments end to end.

type PaystackHandler = { openIframe: () => void };

type PaystackSetupOptions = {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  onClose: () => void;
  callback: (response: { reference: string }) => void;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackSetupOptions) => PaystackHandler;
    };
  }
}

const SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";
let scriptPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack checkout is only available in the browser."));
  }
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack.")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Paystack. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Opens the Paystack popup for a one-off charge. Resolves with the transaction
 * reference on success, or `null` if the shopper closes the popup without paying.
 * `amountUsd` is converted to the smallest currency unit (Paystack's `amount` is in
 * kobo/cents) using a flat cents-style multiplier — Paystack test keys default to NGN,
 * so this is meant for exercising the payment flow end to end, not real FX conversion.
 */
export async function payWithPaystack({
  publicKey,
  email,
  amountUsd,
  reference,
  currency = "NGN",
}: {
  publicKey: string;
  email: string;
  amountUsd: number;
  reference: string;
  currency?: string;
}): Promise<{ reference: string } | null> {
  await loadPaystackScript();
  if (!window.PaystackPop) {
    throw new Error("Paystack failed to load. Please try again.");
  }

  return new Promise((resolve, reject) => {
    try {
      const handler = window.PaystackPop!.setup({
        key: publicKey,
        email,
        amount: Math.round(amountUsd * 100),
        currency,
        ref: reference,
        onClose: () => resolve(null),
        callback: (response) => resolve({ reference: response.reference }),
      });
      handler.openIframe();
    } catch {
      reject(new Error("Couldn't open Paystack. Check that the public key is valid."));
    }
  });
}
