"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ImagePlus,
  Landmark,
  Link2,
  Loader2,
  X,
} from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import { createCampaign, uploadCampaignFlyer } from "@/lib/firebase-helpers";
import {
  getPublicSettings,
  parseCurrency,
  providerMeta,
  type PublicPlatformSettings,
  type ProviderId,
} from "@/lib/platform-settings";

const defaultSettings: PublicPlatformSettings = {
  campaignProcessingFee: "5",
  minCampaignBudget: "50",
  liveProviders: [],
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

const providerIcon: Record<ProviderId, typeof CreditCard> = {
  stripe: CreditCard,
  paypal: Banknote,
  bank: Landmark,
};

type Step = "form" | "payment" | "success";

export default function PostCampaignPage() {
  return (
    <RequireAuth area="brand">
      <PostCampaignPageContent />
    </RequireAuth>
  );
}

function PostCampaignPageContent() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [channelLink, setChannelLink] = useState("");
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [flyer, setFlyer] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const [step, setStep] = useState<Step>("form");

  const [settings, setSettings] = useState<PublicPlatformSettings>(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const enabledMethods = settings.liveProviders;
  const [selectedMethod, setSelectedMethod] = useState<ProviderId | null>(null);
  const method = selectedMethod ?? enabledMethods[0] ?? null;
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    getPublicSettings().then((s) => {
      setSettings(s);
      setSettingsLoading(false);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (flyerPreview) URL.revokeObjectURL(flyerPreview);
    };
  }, [flyerPreview]);

  const handleFlyerChange = (file: File | null) => {
    if (flyerPreview) URL.revokeObjectURL(flyerPreview);
    setFlyer(file);
    setFlyerPreview(file ? URL.createObjectURL(file) : null);
  };

  const budgetAmount = parseCurrency(budget);
  const minBudget = parseCurrency(settings.minCampaignBudget);
  const feeRate = parseCurrency(settings.campaignProcessingFee) / 100;
  const fee = budgetAmount * feeRate;
  const total = budgetAmount + fee;

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!title.trim() || !channelLink.trim() || !budget.trim() || !flyer) {
      setFormError("Fill in the campaign title, channel link, budget, and flyer image.");
      return;
    }
    if (budgetAmount < minBudget) {
      setFormError(`Campaign budget must be at least $${settings.minCampaignBudget}.`);
      return;
    }
    setStep("payment");
  };

  const handlePay = async () => {
    if (!user) {
      setFormError("You must be signed in to post a campaign.");
      return;
    }

    setPaying(true);
    try {
      const flyerUrl = flyer ? await uploadCampaignFlyer(user.id, flyer) : "";
      await createCampaign({
        brandId: user.id,
        title: title.trim(),
        channelLink: channelLink.trim(),
        brief,
        budget: budgetAmount,
        deadline,
        flyerUrl,
        status: "active",
      });
      setPaying(false);
      setStep("success");
    } catch (error) {
      setPaying(false);
      setFormError(error instanceof Error ? error.message : "Could not save the campaign. Please try again.");
    }
  };

  const postAnother = () => {
    setTitle("");
    setChannelLink("");
    setBrief("");
    setBudget("");
    setDeadline("");
    handleFlyerChange(null);
    setFormError("");
    setStep("form");
  };

  if (settingsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post a Campaign</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Drop a link to your channel or page so streamers know exactly where to go and start
        clipping.
      </p>

      {step === "success" ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-6 py-14 text-center dark:border-emerald-400/20 dark:bg-emerald-400/5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Campaign posted
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Payment of ${total.toFixed(2)} received. &ldquo;{title}&rdquo; is live — streamers can
            now follow your link and start submitting clips.
          </p>
          <button
            onClick={postAnother}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95 dark:bg-yellow-400 dark:text-black"
          >
            Post another campaign
          </button>
        </div>
      ) : step === "payment" ? (
        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Pay for &ldquo;{title}&rdquo;
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your campaign goes live as soon as payment is confirmed.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Campaign budget</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ${budgetAmount.toFixed(2)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Processing fee ({settings.campaignProcessingFee}%)
              </span>
              <span className="font-medium text-slate-900 dark:text-white">${fee.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-white/10">
              <span className="font-semibold text-slate-900 dark:text-white">Total</span>
              <span className="font-bold text-amber-600 dark:text-yellow-400">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          {enabledMethods.length === 0 ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              No payment providers are connected yet. Ask an admin to add API keys in Manage
              Payments.
            </p>
          ) : (
            <div>
              <p className={labelClass}>Payment method</p>
              <div className="mt-2 flex flex-col gap-2">
                {enabledMethods.map((m) => {
                  const Icon = providerIcon[m];
                  return (
                    <label
                      key={m}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        method === m
                          ? "border-yellow-400 bg-yellow-50 dark:border-yellow-400/40 dark:bg-yellow-400/5"
                          : "border-slate-200 dark:border-white/10"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        checked={method === m}
                        onChange={() => setSelectedMethod(m)}
                        className="h-4 w-4 accent-amber-500"
                      />
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {providerMeta[m].name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setStep("form")}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Back
            </button>
            <button
              onClick={handlePay}
              disabled={!method || paying}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing payment…
                </>
              ) : (
                `Pay $${total.toFixed(2)} & post campaign`
              )}
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleContinueToPayment}
          className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]"
        >
          <div>
            <label className={labelClass}>Campaign title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clip my latest Twitch VODs"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Campaign flyer</label>
            {flyerPreview ? (
              <div className="relative mt-1.5 h-40 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flyerPreview} alt="Campaign flyer preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleFlyerChange(null)}
                  aria-label="Remove flyer image"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-yellow-400 dark:border-white/15 dark:bg-white/5">
                <ImagePlus className="h-6 w-6 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Click to upload a flyer image
                </span>
                <span className="text-xs text-slate-400">PNG or JPG, used to promote your campaign</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFlyerChange(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <div>
            <label className={labelClass}>Link to your channel or page</label>
            <div className="relative mt-1.5">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={channelLink}
                onChange={(e) => setChannelLink(e.target.value)}
                placeholder="https://twitch.tv/yourchannel"
                className={`${inputClass} mt-0 pl-10`}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Your Twitch, YouTube, Kick, or TikTok page — this is where streamers will go to
              source footage and clip.
            </p>
          </div>

          <div>
            <label className={labelClass}>What do you need?</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              placeholder="e.g. Cut 30-60s highlight clips from my recent streams, vertical format for TikTok/Reels."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Budget</label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={`e.g. $${settings.minCampaignBudget}`}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                ${settings.minCampaignBudget} minimum · +{settings.campaignProcessingFee}%
                processing fee at checkout.
              </p>
            </div>
            <div>
              <label className={labelClass}>Deadline</label>
              <input
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. in 14 days"
                className={inputClass}
              />
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          )}

          <button
            type="submit"
            className="mt-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
          >
            Continue to payment
          </button>
        </form>
      )}
    </div>
  );
}
