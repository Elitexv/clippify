import { ShoppingBag } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="bg-white px-4 pb-20 sm:px-6 lg:px-8">
      <div className="group mx-auto flex max-w-7xl flex-col items-center gap-6 rounded-2xl bg-slate-50 p-8 text-center transition-shadow duration-300 hover:shadow-lg sm:p-10 lg:flex-row lg:justify-between lg:text-left">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-black transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <ShoppingBag className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Ready to find the perfect clip or hire a top editor?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Join thousands of creators and brands growing their content with Clippifi.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href="#"
            className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 text-center text-sm font-semibold text-black shadow-md shadow-yellow-200 transition-transform duration-200 hover:scale-105 hover:opacity-90 active:scale-95"
          >
            Get Started for Free
          </a>
          <a
            href="#clips"
            className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-center text-sm font-medium text-slate-700 transition-transform duration-200 hover:scale-105 hover:bg-slate-100 active:scale-95"
          >
            Browse Clips
          </a>
        </div>
      </div>
    </section>
  );
}
