"use client";

import { useEffect, useState } from "react";
import { Banknote, Check, CreditCard, Eye, EyeOff, KeyRound, Landmark, ShieldAlert } from "lucide-react";
import {
  defaultPlatformSettings,
  getPlatformSettings,
  isProviderConnected,
  providerFieldSchemas,
  providerMeta,
  savePlatformSettings,
  type KeyField,
  type PlatformSettings,
  type ProviderId,
} from "@/lib/platform-settings";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

const providerIcon: Record<ProviderId, typeof CreditCard> = {
  stripe: CreditCard,
  paypal: Banknote,
  bank: Landmark,
};

export default function ManagePaymentsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultPlatformSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getPlatformSettings());
  }, []);

  const toggleEnabled = (id: ProviderId) => {
    setSettings((s) => ({
      ...s,
      paymentProviders: {
        ...s.paymentProviders,
        [id]: { ...s.paymentProviders[id], enabled: !s.paymentProviders[id].enabled },
      },
    }));
    setSaved(false);
  };

  const updateKey = (id: ProviderId, key: string, value: string) => {
    setSettings((s) => ({
      ...s,
      paymentProviders: {
        ...s.paymentProviders,
        [id]: { ...s.paymentProviders[id], keys: { ...s.paymentProviders[id].keys, [key]: value } },
      },
    }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    savePlatformSettings(settings);
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Payments</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Connect payment providers with their API keys so brands and creators can pay for
        campaigns on the platform.
      </p>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-dashed border-amber-300 bg-yellow-50 p-3 text-xs text-amber-800 dark:border-yellow-400/30 dark:bg-yellow-400/5 dark:text-yellow-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          For this demo, keys are stored locally in your browser only. In production, secret
          keys must never be stored or exposed client-side — they belong in a server-side
          environment/secrets manager, accessed only through backend API calls.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-6">
        {(Object.keys(providerMeta) as ProviderId[]).map((id) => {
          const meta = providerMeta[id];
          const config = settings.paymentProviders[id];
          const connected = isProviderConnected(id, config);
          const Icon = providerIcon[id];

          const status = connected && config.enabled
            ? { label: "Live", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400" }
            : connected
              ? { label: "Configured", cls: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400" }
              : { label: "Not connected", cls: "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400" };

          return (
            <section
              key={id}
              className="rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{meta.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{meta.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={config.enabled}
                  aria-label={`Enable ${meta.name}`}
                  onClick={() => toggleEnabled(id)}
                  className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                    config.enabled ? "bg-gradient-to-r from-yellow-400 to-amber-500" : "bg-slate-200 dark:bg-white/10"
                  }`}
                >
                  <span
                    className={`mx-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      config.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {providerFieldSchemas[id].map((field) => (
                  <KeyInput
                    key={field.key}
                    field={field}
                    value={config.keys[field.key] ?? ""}
                    onChange={(v) => updateKey(id, field.key, v)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
          >
            Save changes
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              Payment settings saved
            </span>
          )}
        </div>
      </form>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
        <KeyRound className="h-3.5 w-3.5" />
        A provider only appears as a payment option at campaign checkout once it&apos;s both
        connected (all keys filled) and enabled here.
      </div>
    </div>
  );
}

function KeyInput({
  field,
  value,
  onChange,
}: {
  field: KeyField;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className={labelClass}>{field.label}</label>
      <div className="relative mt-1.5">
        <input
          type={field.secret && !visible ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${inputClass} mt-0 ${field.secret ? "pr-10" : ""}`}
          autoComplete="off"
        />
        {field.secret && (
          <button
            type="button"
            aria-label={visible ? "Hide value" : "Show value"}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
