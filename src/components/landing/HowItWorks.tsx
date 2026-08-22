import { Download, Rocket, Search, ShoppingCart } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Discover",
    text: "Browse thousands of high-quality clips or find the right streamer.",
  },
  {
    icon: ShoppingCart,
    title: "2. Buy or Hire",
    text: "Purchase clips instantly or post a job and hire the best streamer.",
  },
  {
    icon: Download,
    title: "3. Receive",
    text: "Get your clips delivered or review the streamer's work.",
  },
  {
    icon: Rocket,
    title: "4. Publish & Grow",
    text: "Create amazing content and grow your audience.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            How it <span className="text-amber-600">works</span>
          </h2>
          <p className="mt-3 text-slate-500">
            Get the perfect clips or hire streamers in just a few simple steps.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="relative">
              {i < steps.length - 1 && (
                <span className="pointer-events-none absolute left-full top-7 hidden w-6 -translate-x-3 border-t-2 border-dashed border-amber-200 lg:block" />
              )}
              <div className="group rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-200 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="h-6 w-6 text-black" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
