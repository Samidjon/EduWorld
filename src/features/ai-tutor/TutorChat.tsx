"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Character } from "@/components/characters/Character";
import { Button, ErrorNote } from "@/components/ui";
import { useT } from "@/components/shared/LocaleProvider";
import { api, ApiError } from "@/lib/client";

interface Msg { role: "user" | "bot"; content: string; link?: { href: string; label: string } | null; known?: boolean }

const TXT = {
  subtitle: { en: "I answer from my prepared knowledge base: school topics and how EduWorld works.", ru: "Я отвечаю из подготовленной базы знаний: школьные темы и всё про EduWorld." },
  placeholder: { en: "Ask a question…", ru: "Задай вопрос…" },
  privacy: { en: "Never share your address, phone, school or passwords.", ru: "Никогда не пиши свой адрес, телефон, школу или пароли." },
  disabled: { en: "EduBuddy is turned off by your parent.", ru: "EduBuddy выключен родителем." },
  rate: { en: "Slow down a little - try again in a minute.", ru: "Чуть помедленнее - попробуй через минуту." },
};

/** EduBuddy chat backed by the prepared knowledge base (no AI). */
export function TutorChat() {
  const { t, locale } = useT();
  const L = (o: { en: string; ru: string }) => (locale === "en" ? o.en : o.ru);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgs.length) end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  async function send(q?: string) {
    const question = (q ?? text).trim();
    if (busy || !question) return;
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setText("");
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ reply: string; known: boolean; link?: { href: string; label: string } | null }>("/api/tutor/ask", { message: question });
      setMsgs((m) => [...m, { role: "bot", content: r.reply, link: r.link, known: r.known }]);
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "";
      setError(code === "feature_disabled" ? L(TXT.disabled) : code === "rate_limited" ? L(TXT.rate) : code === "network" ? t("networkError") : t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  const starters = locale === "en"
    ? ["What is a fraction?", "Explain the water cycle", "How do I earn coins?", "What is an algorithm?"]
    : ["Что такое дроби?", "Расскажи про круговорот воды", "Как заработать монеты?", "Что такое существительное?"];

  return (
    <div className="flex min-h-[70dvh] flex-col gap-3">
      <div className="glass flex items-center gap-3 rounded-3xl p-3">
        <Character id="oli" portrait size={64} animation={busy ? "think" : "idle"} emotion={busy ? "think" : "happy"} />
        <div>
          <h1 className="font-display text-2xl">EduBuddy</h1>
          <p className="text-sm opacity-80">{L(TXT.subtitle)}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3" aria-live="polite">
        {msgs.length === 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {starters.map((s) => (
              <button key={s} onClick={() => send(s)} className="glass rounded-2xl p-3 text-left text-sm font-semibold hover:bg-white/15">{s}</button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-brand-blue/70 p-3" : "mr-auto max-w-[90%] rounded-3xl rounded-bl-md bg-white/10 p-3"}>
            <p className="whitespace-pre-wrap">{m.content}</p>
            {m.link && (
              <Link href={m.link.href} className="mt-2 inline-flex rounded-full bg-sun px-3 py-1.5 text-sm font-bold text-ink">
                {m.link.label} →
              </Link>
            )}
          </div>
        ))}
        {busy && <p className="opacity-70">🦉 …</p>}
        <div ref={end} className="h-16" aria-hidden />
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      <p className="text-xs opacity-60">🔒 {L(TXT.privacy)}</p>

      <form
        className="glass sticky bottom-24 lg:bottom-4 flex items-end gap-2 rounded-3xl p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={L(TXT.placeholder)}
          className="min-h-11 flex-1 resize-none rounded-2xl bg-black/20 px-3 py-2.5 outline-none placeholder:text-white/50"
          aria-label={L(TXT.placeholder)}
        />
        <Button type="submit" loading={busy} aria-label="Send" className="size-11 px-0">
          <Send className="size-5" />
        </Button>
      </form>
    </div>
  );
}
