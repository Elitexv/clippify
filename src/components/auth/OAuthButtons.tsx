import { Mail } from "lucide-react";

const buttonClass =
  "flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10";

export default function OAuthButtons({
  emailLabel,
  onGoogle,
  onApple,
}: {
  emailLabel: string;
  onGoogle?: () => void | Promise<void>;
  onApple?: () => void | Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className={buttonClass} onClick={() => void onGoogle?.()}>
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>
      <button type="button" className={buttonClass} onClick={() => void onApple?.()}>
        <AppleIcon className="h-4 w-4" />
        Continue with Apple
      </button>
      <button type="button" className={buttonClass}>
        <Mail className="h-4 w-4" />
        {emailLabel}
      </button>
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

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} fill-black dark:fill-white`}
    >
      <path d="M17.05 12.54c-.03-2.36 1.93-3.5 2.02-3.55-1.1-1.6-2.81-1.82-3.42-1.85-1.46-.15-2.85.86-3.59.86-.74 0-1.88-.84-3.09-.82-1.59.02-3.06.93-3.88 2.35-1.65 2.87-.42 7.13 1.19 9.46.78 1.14 1.72 2.42 2.95 2.37 1.18-.05 1.63-.76 3.06-.76 1.42 0 1.83.76 3.08.74 1.27-.02 2.08-1.16 2.86-2.31.9-1.32 1.27-2.6 1.29-2.67-.03-.01-2.44-.94-2.47-3.72zM14.73 5.38c.65-.79 1.09-1.88.97-2.98-.94.04-2.08.63-2.75 1.41-.6.7-1.13 1.83-.99 2.9 1.04.08 2.11-.53 2.77-1.33z" />
    </svg>
  );
}
