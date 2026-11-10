"use client";

import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";
import type { MathInputQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake } from "./shared";
import { ql } from "./labels";

const CHIPS = ["/", "-", "x=", ",", "√", "^", "(", ")", "."];

/** Free math text field with helper chips inserted at the cursor. Input is kept and selected on retry. */
export default function MathInput({ onSubmit, disabled, resetKey, status }: QuestionTypeProps<MathInputQ>) {
  const { t, locale, young } = useT();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const firstKey = useRef(resetKey);

  useEffect(() => {
    if (resetKey === firstKey.current) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [resetKey]);

  const insert = (s: string) => {
    if (disabled) return;
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + s + value.slice(end);
    setValue(next);
    const caret = start + s.length;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const backspace = () => {
    if (disabled) return;
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const from = start === end ? Math.max(0, start - 1) : start;
    setValue(value.slice(0, from) + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(from, from);
    });
  };

  const canSubmit = !disabled && value.trim().length > 0;
  const submit = () => {
    if (canSubmit) onSubmit({ type: "math_input", text: value.trim() });
  };

  return (
    <div className="space-y-4">
      <Shake status={status}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            aria-label={t("typeAnswer")}
            placeholder={t("typeAnswer")}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            className={cn(
              "w-full min-w-0 rounded-3xl border-4 bg-white/10 px-4 text-center font-mono font-bold text-white outline-none transition placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-white/40 focus:bg-white/15",
              young ? "h-20 text-4xl" : "h-16 text-3xl",
              status === "correct" ? "border-mint bg-mint/25" : status === "wrong" ? "border-coral/80 bg-coral/15" : "border-white/20 focus:border-sun",
            )}
          />
        </form>
      </Shake>

      <div role="group" aria-label={t("typeAnswer")} className="flex flex-wrap justify-center gap-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault() /* keep the caret in the field */}
            onClick={() => insert(c)}
            aria-label={c === "," ? ql(locale, "comma") : c === "-" ? ql(locale, "minus") : c}
            className={cn(
              "glass grid place-items-center rounded-2xl px-3 font-mono font-bold text-white transition enabled:hover:bg-white/15! enabled:active:scale-95 disabled:opacity-50",
              young ? "min-h-16 min-w-16 text-2xl" : "min-h-11 min-w-12 text-xl",
            )}
          >
            {c === "-" ? "−" : c}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onMouseDown={(e) => e.preventDefault()}
          onClick={backspace}
          aria-label={ql(locale, "backspace")}
          className={cn(
            "glass grid place-items-center rounded-2xl px-3 text-white transition enabled:hover:bg-white/15! disabled:opacity-50",
            young ? "min-h-16 min-w-16" : "min-h-11 min-w-12",
          )}
        >
          <Delete className="size-6" aria-hidden />
        </button>
      </div>

      <div className="flex justify-center">
        <CheckButton disabled={!canSubmit} onClick={submit} />
      </div>
    </div>
  );
}
