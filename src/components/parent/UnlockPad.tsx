"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Delete } from "lucide-react";
import { ErrorNote, Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client";
import { useP } from "./i18n";

/** Big-button PIN pad. Submits automatically after the 4th digit. */
export function UnlockPad() {
  const { t, err } = useP();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const submit = useCallback(async (value: string) => {
    setBusy(true);
    setError("");
    try {
      await api("/api/parent/unlock", { pin: value });
      setOk(true);
      window.location.href = "/parent/dashboard";
    } catch (e) {
      setError(err(e));
      setPin("");
      setBusy(false);
    }
  }, [err]);

  const press = useCallback((d: string) => {
    if (busy || ok) return;
    if (pin.length >= 4) return;
    setError("");
    const n = pin + d;
    setPin(n);
    if (n.length === 4) void submit(n);
  }, [busy, ok, pin, submit]);

  const del = useCallback(() => !busy && setPin((p) => p.slice(0, -1)), [busy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") del();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, del]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const btn = "h-20 rounded-3xl bg-white border border-slate-200 text-3xl font-display text-ink shadow-sm hover:bg-slate-50 active:scale-95 transition disabled:opacity-50";

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4" role="status" aria-live="polite" aria-label={t("unlockPinLabel", { n: pin.length })}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("size-5 rounded-full border-2 transition", i < pin.length ? "border-brand-blue bg-brand-blue" : "border-slate-300 bg-white")} aria-hidden />
        ))}
      </div>

      <div className="min-h-12">
        {busy && !ok && <p className="flex items-center justify-center gap-2 text-sm text-slate-600"><Spinner className="size-4" /> {t("unlockChecking")}</p>}
        {ok && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{t("unlockOk")}</p>}
        <ErrorNote>{error}</ErrorNote>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {keys.map((k) => (
          <button key={k} type="button" className={btn} onClick={() => press(k)} disabled={busy || ok}>{k}</button>
        ))}
        <span aria-hidden />
        <button type="button" className={btn} onClick={() => press("0")} disabled={busy || ok}>0</button>
        <button type="button" className={cn(btn, "grid place-items-center")} onClick={del} disabled={busy || ok || !pin} aria-label={t("unlockDelete")}>
          <Delete className="size-7" aria-hidden />
        </button>
      </div>

      <p className="text-xs text-slate-500">{t("unlockForgot")}</p>

      <Link href="/play/dashboard" className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 font-bold text-ink hover:bg-slate-50">
        <ArrowLeft className="size-4" aria-hidden />
        {t("backToGame")}
      </Link>
    </div>
  );
}
