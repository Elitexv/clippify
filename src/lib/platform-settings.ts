export type PaymentMethod = "card" | "paypal" | "bank";

export type PlatformSettings = {
  commissionRate: string;
  payoutSchedule: "Weekly" | "Biweekly" | "Monthly";
  autoModeration: boolean;
  allowHostedCompetitions: boolean;
  maintenanceMode: boolean;
  campaignProcessingFee: string;
  minCampaignBudget: string;
  paymentMethods: Record<PaymentMethod, boolean>;
};

const STORAGE_KEY = "clippifi.admin-settings";

export const defaultPlatformSettings: PlatformSettings = {
  commissionRate: "15",
  payoutSchedule: "Biweekly",
  autoModeration: false,
  allowHostedCompetitions: true,
  maintenanceMode: false,
  campaignProcessingFee: "5",
  minCampaignBudget: "50",
  paymentMethods: { card: true, paypal: true, bank: false },
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
      paymentMethods: { ...defaultPlatformSettings.paymentMethods, ...parsed.paymentMethods },
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
