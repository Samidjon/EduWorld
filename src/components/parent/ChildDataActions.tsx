"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { Button, ErrorNote, Field, LightCard, Modal, inputCls } from "@/components/ui";
import { api } from "@/lib/client";
import { useP } from "./i18n";
import { SuccessNote } from "./controls";

/** Redo the diagnostic (PATCH resetAssessment). */
export function RedoDiagnosticButton({ childId }: { childId: string }) {
  const { t, err } = useP();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const run = async () => {
    setBusy(true);
    setError("");
    setOk(false);
    try {
      await api(`/api/children/${childId}`, { resetAssessment: true }, "PATCH");
      setOk(true);
      router.refresh();
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-2">
      <Button type="button" variant="light" onClick={run} loading={busy} icon={<RotateCcw className="size-4" aria-hidden />}>
        {t("redoDiagnostic")}
      </Button>
      <ErrorNote>{error}</ErrorNote>
      {ok && <SuccessNote>{t("redoDone")}</SuccessNote>}
    </div>
  );
}

/** Export + delete. Deleting requires typing the child's nickname. */
export function ChildDangerZone({ childId, nickname }: { childId: string; nickname: string }) {
  const { t, err } = useP();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const matches = confirm.trim() === nickname.trim();

  const del = async () => {
    if (!matches) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/children/${childId}`, undefined, "DELETE");
      window.location.href = "/parent/dashboard";
    } catch (e) {
      setError(err(e));
      setBusy(false);
    }
  };

  return (
    <LightCard className="space-y-5 p-6">
      <h2 className="font-display text-xl">{t("dangerZone")}</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{t("exportText")}</p>
        <a href={`/api/children/${childId}`} download className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 font-display font-semibold text-ink hover:bg-slate-50">
          <Download className="size-4" aria-hidden /> {t("exportData")}
        </a>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{t("deleteChildText")}</p>
        <Button type="button" variant="danger" className="shrink-0" onClick={() => { setOpen(true); setConfirm(""); setError(""); }} icon={<Trash2 className="size-4" aria-hidden />}>
          {t("deleteChild")}
        </Button>
      </div>

      <Modal open={open} onClose={() => !busy && setOpen(false)} title={t("deleteChild")} light>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t("deleteChildText")}</p>
          <Field label={t("deleteChildConfirm", { name: nickname })}>
            <input className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" autoFocus />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="light" onClick={() => setOpen(false)} disabled={busy}>{t("cancel")}</Button>
            <Button type="button" variant="danger" onClick={del} disabled={!matches} loading={busy}>
              {busy ? t("deleting") : t("deleteForever")}
            </Button>
          </div>
        </div>
      </Modal>
    </LightCard>
  );
}
