import { ShoppingBag } from "lucide-react";
import { btnPrimary, btnSecondary } from "@/lib/button-styles";

export default function CtaBanner() {
  return (
    <section className="bg-white px-4 pb-20 sm:px-6 lg:px-8">
      <div className="group mx-auto flex max-w-7xl flex-col items-center gap-6 rounded-2xl bg-slate-50 p-8 text-center transition-shadow duration-300 hover:shadow-lg sm:p-10 lg:flex-row lg:justify-between lg:text-left">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-black transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <ShoppingBag className="h-6 w-6" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
              Ready to connect with top streamers and clip editors?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Join creators and brands building better content partnerships with Clippifi.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a href="/signup" className={`rounded-lg px-6 py-3 text-center text-sm ${btnPrimary}`}>
            Get Started for Free
          </a>
          <a href="#clips" className={`rounded-lg bg-white px-6 py-3 text-center text-sm ${btnSecondary}`}>
            Find Talent
          </a>
        </div>
      </div>
    </section>
  );
}
