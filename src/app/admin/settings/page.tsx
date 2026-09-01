"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, CreditCard, KeyRound, Settings } from "lucide-react";
import {
  defaultPlatformSettings,
  getPlatformSettings,
  savePlatformSettings,
  type PlatformSettings,
} from "@/lib/platform-settings";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultPlatformSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPlatformSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await savePlatformSettings(settings);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Platform configuration, fees, and moderation rules.
      </p>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-6">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Payments</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Platform commission rate</label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.commissionRate}
                  onChange={(e) => update("commissionRate", e.target.value)}
                  className={`${inputClass} mt-0 pr-8`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  %
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Taken from clip sales and job payments before creator payout.
              </p>
            </div>
            <div>
              <label className={labelClass}>Payout schedule</label>
              <select
                value={settings.payoutSchedule}
                onChange={(e) => update("payoutSchedule", e.target.value as PlatformSettings["payoutSchedule"])}
                className={inputClass}
              >
                <option value="Weekly">Weekly</option>
                <option value="Biweekly">Biweekly</option>
                <option value="Monthly">Monthly</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-400">
                How often creator and streamer earnings are released.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Campaign payments</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Controls how brands and creators pay for the campaigns they post, based on the
            budget they set.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Campaign processing fee</label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.campaignProcessingFee}
                  onChange={(e) => update("campaignProcessingFee", e.target.value)}
                  className={`${inputClass} mt-0 pr-8`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  %
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Added on top of the campaign budget at checkout.
              </p>
            </div>
            <div>
              <label className={labelClass}>Minimum campaign budget</label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  value={settings.minCampaignBudget}
                  onChange={(e) => update("minCampaignBudget", e.target.value)}
                  className={`${inputClass} mt-0 pl-7`}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Campaigns below this budget can&apos;t be posted.
              </p>
            </div>
          </div>

          <Link
            href="/admin/manage-payments"
            className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-200 px-3 py-2.5 text-sm text-slate-600 transition-colors hover:border-yellow-400 hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:text-white"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-slate-400" />
              Connect payment providers &amp; API keys
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-yellow-400">
              Manage Payments →
            </span>
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Moderation & competitions</h2>
          <div className="mt-4 flex flex-col gap-4">
            <SettingToggle
              label="Auto-approve clip submissions"
              description="Skip the manual moderation queue for new clip uploads and link submissions."
              checked={settings.autoModeration}
              onChange={(v) => update("autoModeration", v)}
            />
            <SettingToggle
              label="Allow brand-hosted competitions"
              description="Let brand accounts create and manage their own clipping competitions."
              checked={settings.allowHostedCompetitions}
              onChange={(v) => update("allowHostedCompetitions", v)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Platform</h2>
          <div className="mt-4">
            <SettingToggle
              label="Maintenance mode"
              description="Show a maintenance banner and block new logins across the platform."
              checked={settings.maintenanceMode}
              onChange={(v) => update("maintenanceMode", v)}
              danger
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              Settings saved
            </span>
          )}
        </div>
      </form>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
        <Settings className="h-3.5 w-3.5" />
        Changes apply platform-wide and are shared with every admin.
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
  danger,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  danger?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked
            ? danger
              ? "bg-red-500"
              : "bg-gradient-to-r from-yellow-400 to-amber-500"
            : "bg-slate-200 dark:bg-white/10"
        }`}
      >
        <span
          className={`mx-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
