"use client";

import { useEffect, useRef, useState } from "react";
import type { FillBlankQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import type { QuestionTypeProps } from "./types";
import { CheckButton, Shake } from "./shared";

/** Text with an inline input replacing the "___" placeholder. Wrong input is kept and selected on retry. */
export default function FillBlank({ q, onSubmit, disabled, resetKey, status }: QuestionTypeProps<FillBlankQ>) {
  const { t, tl, young } = useT();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const firstKey = useRef(resetKey);

  useEffect(() => {
    if (resetKey === firstKey.current) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [resetKey]);

  const full = tl(q.text);
  const at = full.indexOf("___");
  const before = at >= 0 ? full.slice(0, at) : full;
  const after = at >= 0 ? full.slice(at + 3).replace(/^_+/, "") : "";

  const canSubmit = !disabled && value.trim().length > 0;
  const submit = () => {
    if (canSubmit) onSubmit({ type: "fill_blank", text: value.trim() });
  };

  const width = `${Math.min(Math.max(value.length + 2, 5), 18)}ch`;

  return (
    <div className="space-y-5">
      <Shake status={status}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className={cn("glass rounded-3xl p-4 leading-[2.4] text-white break-words", young ? "text-2xl" : "text-lg sm:text-xl")}
        >
          {before && <span>{before}</span>}
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            aria-label={t("typeAnswer")}
            placeholder="?"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            style={{ width }}
            className={cn(
              "mx-1 inline-block max-w-full rounded-xl border-b-4 bg-white/15 px-2 text-center font-bold text-white outline-none transition",
              "placeholder:text-white/40 focus:bg-white/25",
              young ? "h-14" : "h-11",
              status === "correct" ? "border-mint bg-mint/25" : status === "wrong" ? "border-coral bg-coral/20" : "border-sun",
            )}
          />
          {after && <span>{after}</span>}
        </form>
      </Shake>
      <div className="flex justify-center">
        <CheckButton disabled={!canSubmit} onClick={submit} />
      </div>
    </div>
  );
}
