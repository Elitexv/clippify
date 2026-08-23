"use client";

import { useState } from "react";
import { CheckCircle2, Link2 } from "lucide-react";

const categories = ["Tech", "Sports", "Motivation", "Nature", "Gaming", "Podcast"];

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim() || !price.trim()) return;
    setSubmitted(true);
  };

  const submitAnother = () => {
    setTitle("");
    setLink("");
    setPrice("");
    setCategory(categories[0]);
    setSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Link</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Already posted your clip on TikTok, YouTube, or Instagram? Drop the link and list it
        for buyers instead of re-uploading the file.
      </p>

      {submitted ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-6 py-14 text-center dark:border-emerald-400/20 dark:bg-emerald-400/5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Link submitted for review
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            We&apos;ll verify the link and list &ldquo;{title}&rdquo; on the marketplace shortly.
          </p>
          <button
            onClick={submitAnother}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95 dark:bg-yellow-400 dark:text-black"
          >
            Submit another link
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]"
        >
          <div>
            <label className={labelClass}>Clip title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Game-Winning Shot!"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Link to your clip</label>
            <div className="relative mt-1.5">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://tiktok.com/@you/video/..."
                className={`${inputClass} mt-0 pl-10`}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Paste the public link from TikTok, YouTube Shorts, Instagram Reels, or wherever
              it&apos;s posted.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. $12"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
          >
            Submit link
          </button>
        </form>
      )}
    </div>
  );
}
