import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

const SETTINGS_DOC = doc(db, "settings", "platform");
// Derived, non-secret subset of the settings above — safe for any signed-in user to
// read. The full settings/platform doc (with provider secret keys) must stay
// admin-only per Firestore rules; checkout flows read this doc instead.
const PUBLIC_SETTINGS_DOC = doc(db, "settings", "public");

export type PublicPlatformSettings = {
  campaignProcessingFee: string;
  minCampaignBudget: string;
  liveProviders: ProviderId[];
};

const defaultPublicSettings: PublicPlatformSettings = {
  campaignProcessingFee: defaultPlatformSettings.campaignProcessingFee,
  minCampaignBudget: defaultPlatformSettings.minCampaignBudget,
  liveProviders: [],
};

function normalize(raw: unknown): PlatformSettings {
  const parsed = (raw ?? {}) as Partial<PlatformSettings>;
  return {
    ...defaultPlatformSettings,
    ...parsed,
    paymentProviders: {
      stripe: { ...emptyProvider(), ...parsed.paymentProviders?.stripe },
      paypal: { ...emptyProvider(), ...parsed.paymentProviders?.paypal },
      bank: { ...emptyProvider(), ...parsed.paymentProviders?.bank },
    },
  };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const snap = await getDoc(SETTINGS_DOC);
    return snap.exists() ? normalize(snap.data()) : defaultPlatformSettings;
  } catch (error) {
    console.error("Failed to load platform settings:", error);
    return defaultPlatformSettings;
  }
}

export function subscribeToPlatformSettings(callback: (settings: PlatformSettings) => void) {
  return onSnapshot(
    SETTINGS_DOC,
    (snap) => callback(snap.exists() ? normalize(snap.data()) : defaultPlatformSettings),
    (error) => {
      console.error("Platform settings listener error:", error);
      callback(defaultPlatformSettings);
    },
  );
}

export async function savePlatformSettings(settings: PlatformSettings) {
  await setDoc(SETTINGS_DOC, settings, { merge: false });
  const publicSettings: PublicPlatformSettings = {
    campaignProcessingFee: settings.campaignProcessingFee,
    minCampaignBudget: settings.minCampaignBudget,
    liveProviders: getLiveProviders(settings),
  };
  await setDoc(PUBLIC_SETTINGS_DOC, publicSettings, { merge: false });
}

/**
 * For non-admin checkout flows (Post a Campaign, clip licensing). Reads only the
 * derived public doc — never touches provider secret keys.
 */
export async function getPublicSettings(): Promise<PublicPlatformSettings> {
  try {
    const snap = await getDoc(PUBLIC_SETTINGS_DOC);
    return snap.exists() ? { ...defaultPublicSettings, ...(snap.data() as Partial<PublicPlatformSettings>) } : defaultPublicSettings;
  } catch (error) {
    console.error("Failed to load public settings:", error);
    return defaultPublicSettings;
  }
}

export function parseCurrency(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Providers a brand or creator can actually pay with: connected AND enabled by an admin. */
export function isProviderConnected(providerId: ProviderId, config: ProviderConfig): boolean {
  return providerFieldSchemas[providerId].every((field) => (config.keys[field.key] ?? "").trim().length > 0);
}

export function getLiveProviders(settings: PlatformSettings): ProviderId[] {
  return (Object.keys(settings.paymentProviders) as ProviderId[]).filter(
    (id) => settings.paymentProviders[id].enabled && isProviderConnected(id, settings.paymentProviders[id])
  );
}
