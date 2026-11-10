"use client";

import { useEffect, useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import type { AudioRecognitionQ } from "@/types/content";
import { cn } from "@/lib/cn";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx, speak } from "@/lib/audio";
import type { QuestionTypeProps } from "./types";
import { Shake, choiceCls, shuffledIndexes, tileCls, useOnReset } from "./shared";
import { ql } from "./labels";

/** Speaker button (auto-plays once on mount) + option buttons; submits on tap. */
export default function AudioRecognition({ q, onSubmit, disabled, resetKey, status }: QuestionTypeProps<AudioRecognitionQ>) {
  const { t, tl, locale, young } = useT();
  const order = useMemo(() => shuffledIndexes(q.options.length, q.id), [q.id, q.options.length]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [played, setPlayed] = useState(false);
  useOnReset(resetKey, () => setChosen(null));

  const say = tl(q.say);
  useEffect(() => {
    // small delay so speech voices have a chance to load; cleanup makes it run once per mount
    const id = window.setTimeout(() => {
      speak(say, locale, { required: true });
      setPlayed(true);
    }, 350);
    return () => window.clearTimeout(id);
  }, [q.id]);

  const play = () => {
    speak(say, locale, { required: true });
    setPlayed(true);
  };

  const pick = (i: number) => {
    if (disabled) return;
    sfx("click");
    setChosen(i);
    onSubmit({ type: "audio_recognition", index: i });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={play}
          aria-label={played ? ql(locale, "playAgain") : t("listen")}
          className={cn("voice-required",
            "btn-orb grid place-items-center rounded-full text-white transition active:scale-95",
            young ? "size-24" : "size-20",
          )}
        >
          <Volume2 className={young ? "size-12" : "size-10"} aria-hidden />
        </button>
      </div>
      <Shake status={status}>
        <div role="group" className={cn("grid gap-3", !young && q.options.length > 2 ? "sm:grid-cols-2" : "")}>
          {order.map((i) => {
            const sel = chosen === i;
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                aria-pressed={sel}
                onClick={() => pick(i)}
                className={cn(tileCls(young), "w-full text-center break-words font-display", young && "text-2xl", choiceCls(sel, sel ? status : null))}
              >
                {tl(q.options[i])}
              </button>
            );
          })}
        </div>
      </Shake>
    </div>
  );
}
