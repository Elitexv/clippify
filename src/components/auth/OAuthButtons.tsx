const buttonClass =
  "flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10";

export default function OAuthButtons({
  onGoogle,
  tiktokHref,
  disabled,
}: {
  onGoogle?: () => void | Promise<void>;
  // A real page navigation, not a click handler — TikTok sign-in is a full OAuth
  // redirect round-trip through our own /api/tiktok/authorize (see
  // src/app/api/tiktok/callback's intent=login branch), unlike Google's popup flow.
  tiktokHref?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className={buttonClass} disabled={disabled} onClick={() => void onGoogle?.()}>
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>
      {tiktokHref && (
        <a
          href={disabled ? undefined : tiktokHref}
          aria-disabled={disabled}
          className={`${buttonClass} ${disabled ? "pointer-events-none" : ""}`}
        >
          <TikTokIcon className="h-4 w-4" />
          Continue with TikTok
        </a>
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3a7.4 7.4 0 0 1-11-3.9H1.06v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.05 14.2a7.2 7.2 0 0 1 0-4.4V6.71H1.07a12 12 0 0 0 0 10.58l3.98-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.06 6.71l3.99 3.09A7.16 7.16 0 0 1 12 4.75z"
      />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-black dark:fill-white`}>
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}
