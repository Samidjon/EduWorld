"use client";

import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";
import type { NumberInputQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake, useOnReset } from "./shared";
import { ql } from "./labels";

/** Parses "12", "-3", "1,5", "1.5", "−2" (unicode minus). Returns null for anything else. */
export function parseNumberInput(raw: string): number | null {
  const s = raw.replace(/\s+/g, "").replace(/−/g, "-").replace(",", ".");
  if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

/** Keeps only characters that can form a number; allows one leading minus and one decimal separator. */
function sanitize(raw: string): string {
  let s = raw.replace(/−/g, "-").replace(/[^\d.,-]/g, "");
  const neg = s.startsWith("-");
  s = s.replace(/-/g, "");
  const sep = s.search(/[.,]/);
  if (sep >= 0) s = s.slice(0, sep + 1) + s.slice(sep + 1).replace(/[.,]/g, "");
  return (neg ? "-" : "") + s.slice(0, 12);
}

/**
 * Big numeric field; when `young`, an on-screen number pad is shown (and the field does not open the
 * system keyboard). Accepts comma decimals and negatives. On retry: young -> cleared, otherwise kept & selected.
 */
export default function NumberInput({ q, onSubmit, disabled, resetKey, status }: QuestionTypeProps<NumberInputQ>) {
  const { t, tl, locale, young } = useT();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const firstKey = useRef(resetKey);
  useOnReset(resetKey, () => {
    if (young) setValue("");
  });
  useEffect(() => {
    if (resetKey === firstKey.current || young) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [resetKey, young]);

  const parsed = parseNumberInput(value);
  const canSubmit = !disabled && parsed !== null;
  const submit = () => {
    if (canSubmit && parsed !== null) onSubmit({ type: "number_input", value: parsed });
  };

  const press = (k: string) => {
    if (disabled) return;
    sfx("click");
    setValue((v) => {
      if (k === "back") return v.slice(0, -1);
      if (k === "-") return v.startsWith("-") ? v.slice(1) : `-${v}`;
      return sanitize(v + k);
    });
  };

  const unit = tl(q.unit);
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "0", ","];
  const keyLabel = (k: string) => (k === "-" ? ql(locale, "minus") : k === "," ? ql(locale, "comma") : k);

  return (
    <div className="space-y-4">
      <Shake status={status}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center justify-center gap-3"
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(sanitize(e.target.value))}
            disabled={disabled}
            inputMode={young ? "none" : "decimal"}
            aria-label={t("typeAnswer")}
            placeholder="?"
            autoComplete="off"
            enterKeyHint="done"
            className={cn(
              "w-full max-w-60 min-w-0 rounded-3xl border-4 bg-white/10 text-center font-display font-bold text-white outline-none transition placeholder:text-white/35 focus:bg-white/15",
              young ? "h-20 text-5xl" : "h-16 text-4xl",
              status === "correct" ? "border-mint bg-mint/25" : status === "wrong" ? "border-coral/80 bg-coral/15" : "border-white/20 focus:border-sun",
            )}
          />
          {unit && <span className={cn("shrink-0 font-display text-white/85", young ? "text-3xl" : "text-2xl")}>{unit}</span>}
        </form>
      </Shake>

      {young && (
        <div className="mx-auto grid max-w-xs grid-cols-3 gap-2" role="group" aria-label={t("typeAnswer")}>
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              disabled={disabled}
              onClick={() => press(k)}
              aria-label={keyLabel(k)}
              className="glass min-h-16 rounded-2xl font-display text-3xl font-bold text-white transition enabled:hover:bg-white/15! enabled:active:scale-95 disabled:opacity-50"
            >
              {k === "-" ? "−" : k}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled || value.length === 0}
            onClick={() => press("back")}
            aria-label={ql(locale, "backspace")}
            className="glass col-span-3 grid min-h-16 place-items-center rounded-2xl text-white transition enabled:hover:bg-white/15! disabled:opacity-50"
          >
            <Delete className="size-8" aria-hidden />
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <CheckButton disabled={!canSubmit} onClick={submit} />
      </div>
    </div>
  );
}
