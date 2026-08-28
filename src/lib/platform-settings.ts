export type ProviderId = "stripe" | "paypal" | "bank";

export type ProviderConfig = {
  enabled: boolean;
  keys: Record<string, string>;
};

export type PlatformSettings = {
  commissionRate: string;
  payoutSchedule: "Weekly" | "Biweekly" | "Monthly";
  autoModeration: boolean;
  allowHostedCompetitions: boolean;
  maintenanceMode: boolean;
  campaignProcessingFee: string;
  minCampaignBudget: string;
  paymentProviders: Record<ProviderId, ProviderConfig>;
};

export type KeyField = {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
};

export const providerMeta: Record<ProviderId, { name: string; description: string }> = {
  stripe: { name: "Stripe", description: "Card payments via Stripe Checkout." },
  paypal: { name: "PayPal", description: "PayPal and Venmo payments." },
  bank: { name: "Bank transfer", description: "Manual ACH / wire transfer details." },
};

export const providerFieldSchemas: Record<ProviderId, KeyField[]> = {
  stripe: [
    { key: "publishableKey", label: "Publishable key", placeholder: "pk_live_…" },
    { key: "secretKey", label: "Secret key", placeholder: "sk_live_…", secret: true },
    { key: "webhookSecret", label: "Webhook signing secret", placeholder: "whsec_…", secret: true },
  ],
  paypal: [
    { key: "clientId", label: "Client ID", placeholder: "AZDx2…" },
    { key: "clientSecret", label: "Client secret", placeholder: "EOxy9…", secret: true },
  ],
  bank: [
    { key: "accountName", label: "Account holder name", placeholder: "Clippifi Inc." },
    { key: "accountNumber", label: "Account number", placeholder: "000123456789" },
    { key: "routingNumber", label: "Routing number", placeholder: "021000021" },
  ],
};

const STORAGE_KEY = "clippifi.admin-settings";

const emptyProvider = (): ProviderConfig => ({ enabled: false, keys: {} });

export const defaultPlatformSettings: PlatformSettings = {
  commissionRate: "15",
  payoutSchedule: "Biweekly",
  autoModeration: false,
  allowHostedCompetitions: true,
  maintenanceMode: false,
  campaignProcessingFee: "5",
  minCampaignBudget: "50",
  paymentProviders: {
    stripe: emptyProvider(),
    paypal: emptyProvider(),
    bank: emptyProvider(),
  },
};

export function getPlatformSettings(): PlatformSettings {
  if (typeof window === "undefined") return defaultPlatformSettings;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPlatformSettings;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultPlatformSettings,
      ...parsed,
      paymentProviders: {
        stripe: { ...emptyProvider(), ...parsed.paymentProviders?.stripe },
        paypal: { ...emptyProvider(), ...parsed.paymentProviders?.paypal },
        bank: { ...emptyProvider(), ...parsed.paymentProviders?.bank },
      },
    };
  } catch {
    return defaultPlatformSettings;
  }
}

export function savePlatformSettings(settings: PlatformSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function parseCurrency(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** A provider is "connected" once every required key field for it has a value. */
export function isProviderConnected(providerId: ProviderId, config: ProviderConfig): boolean {
  return providerFieldSchemas[providerId].every((field) => (config.keys[field.key] ?? "").trim().length > 0);
}

/** Providers a buyer/brand can actually pay with: connected AND enabled by an admin. */
export function getLiveProviders(settings: PlatformSettings): ProviderId[] {
  return (Object.keys(settings.paymentProviders) as ProviderId[]).filter(
    (id) => settings.paymentProviders[id].enabled && isProviderConnected(id, settings.paymentProviders[id])
  );
}
