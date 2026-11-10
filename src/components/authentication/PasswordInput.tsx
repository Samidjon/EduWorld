"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputCls } from "@/components/ui";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { showLabel: string; hideLabel: string };

/** Password field with a show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput({ showLabel, hideLabel, className, ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <input ref={ref} type={visible ? "text" : "password"} className={`${inputCls} pr-12 ${className ?? ""}`} {...rest} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-ink/60 hover:bg-slate-100 hover:text-ink"
      >
        {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </span>
  );
});
