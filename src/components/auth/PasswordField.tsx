"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordField({
  label,
  placeholder,
  hint,
  action,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  hint?: string;
  action?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
        {action}
      </div>
      <div className="relative mt-1.5">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-yellow-400"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
