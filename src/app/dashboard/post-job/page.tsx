"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import { btnPrimary, btnSecondary } from "@/lib/button-styles";
import { uploadCampaignFlyer } from "@/lib/firebase-helpers";
import { auth } from "@/lib/firebase";
import { defaultPublicSettings as defaultSettings, getPublicSettings, parseCurrency, type PublicPlatformSettings } from "@/lib/platform-settings";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

type Step = "form" | "payment";

export default function PostCampaignPage() {
  return (
    <RequireAuth area="brand">
      <Suspense fallback={null}>
        <PostCampaignPageContent />
      </Suspense>
    </RequireAuth>
  );
}

function PostCampaignPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
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
  const [paying, setPaying] = useState(false);

  const cancelled = searchParams.get("cancelled") === "1";

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
      setFormError(`Campaign budget must be at least ₦${settings.minCampaignBudget}.`);
      return;
    }
    setStep("payment");
  };

  // The server recomputes the total from the platform's fee settings — the figure
  // shown here is only a preview. The campaign stays hidden until Bachs' signed
  // webhook confirms payment (see src/app/api/bachs/webhook/route.ts).
  const handlePay = async () => {
    if (!user || !auth.currentUser) {
      setFormError("You must be signed in to post a campaign.");
      return;
    }
    setPaying(true);
    setFormError("");
    try {
      const flyerUrl = flyer ? await uploadCampaignFlyer(user.id, flyer) : "";
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/bachs/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title,
          channelLink,
          brief,
          budget: budgetAmount,
          deadline,
          flyerUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Couldn't start checkout. Try again.");
      }
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setPaying(false);
      setFormError(error instanceof Error ? error.message : "Could not start checkout. Please try again.");
    }
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
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Post a Campaign</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Drop a link to your channel or page so streamers know exactly where to go and start
        clipping.
      </p>

      {cancelled && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400">
          Checkout was cancelled. Your campaign wasn&apos;t posted.
        </p>
      )}

      {step === "payment" ? (
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
              <span className="font-medium text-slate-900 dark:text-white">₦{budgetAmount.toFixed(2)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Processing fee ({settings.campaignProcessingFee}%)</span>
              <span className="font-medium text-slate-900 dark:text-white">₦{fee.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 dark:border-white/10">
              <span className="font-semibold text-slate-900 dark:text-white">Total</span>
              <span className="font-bold text-amber-600 dark:text-yellow-400">₦{total.toFixed(2)}</span>
            </div>
          </div>

          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setStep("form")}
              disabled={paying}
              className={`rounded-lg px-4 py-2.5 text-sm ${btnSecondary}`}
            >
              Back
            </button>
            <button
              onClick={handlePay}
              disabled={paying}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm ${btnPrimary}`}
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening checkout…
                </>
              ) : (
                `Pay ₦${total.toFixed(2)} & post campaign`
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
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload a flyer image</span>
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
              Your Twitch, YouTube, Kick, or TikTok page — this is where streamers will go to source footage and clip.
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
                placeholder={`e.g. ₦${settings.minCampaignBudget}`}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                ₦{settings.minCampaignBudget} minimum · +{settings.campaignProcessingFee}% processing fee at checkout.
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

          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <button type="submit" className={`mt-1 rounded-lg py-2.5 text-sm ${btnPrimary}`}>
            Continue to payment
          </button>
        </form>
      )}
    </div>
  );
}
