import Image from "next/image";
import { Play, ShieldCheck, ShoppingCart, Users } from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Buy or license clips",
    text: "High-quality clips ready for your content.",
  },
  {
    icon: Users,
    title: "Hire talented editors",
    text: "Post a job and work with the best.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & secure",
    text: "Secure payments and creator protection.",
  },
];

export default function LoginBrandPanel() {
  return (
    <div>
      <h2 className="text-3xl font-bold leading-tight text-black dark:text-white xl:text-4xl">
        Welcome back to{" "}
        <span className="text-black dark:bg-gradient-to-r dark:from-yellow-300 dark:to-amber-400 dark:bg-clip-text dark:text-transparent">
          Clippifi
        </span>
      </h2>
      <p className="mt-3 max-w-sm text-sm text-black/70 dark:text-slate-400">
        The marketplace for premium video clips and top editors.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/10 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-black dark:text-white">{title}</p>
              <p className="text-xs text-black/60 dark:text-slate-400">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-10 hidden h-40 w-56 xl:block">
        <div className="absolute left-0 top-4 h-32 w-24 -rotate-6 overflow-hidden rounded-xl border-2 border-black/10 shadow-xl dark:border-white/10">
          <Image
            src="https://picsum.photos/seed/clippifi-login-a/200/280"
            alt=""
            fill
            sizes="96px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Play className="h-3 w-3 fill-white text-white" />
            </span>
          </span>
        </div>
        <div className="absolute left-20 top-0 h-36 w-24 rotate-6 overflow-hidden rounded-xl border-2 border-black/10 shadow-xl dark:border-white/10">
          <Image
            src="https://picsum.photos/seed/clippifi-login-b/200/300"
            alt=""
            fill
            sizes="96px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Play className="h-3 w-3 fill-white text-white" />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
