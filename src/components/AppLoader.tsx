import Logo from "@/components/Logo";

export default function AppLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-white dark:bg-[#0a0a0a]">
      <Logo className="h-14 w-14 animate-float" />
      <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 animate-loader-bar" />
      </div>
    </div>
  );
}
