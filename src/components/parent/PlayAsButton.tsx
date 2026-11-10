"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { Button, ErrorNote } from "@/components/ui";
import { api } from "@/lib/client";
import { useP } from "./i18n";

/** Switches this device into child mode for the given child and opens the game. */
export function PlayAsButton({ childId, nickname }: { childId: string; nickname: string }) {
  const { t, err } = useP();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const go = async () => {
    setBusy(true);
    setError("");
    try {
      await api(`/api/children/${childId}`);
      // the child layout redirects to the diagnostic when it has not been taken yet
      window.location.href = "/play/dashboard";
    } catch (e) {
      setError(err(e));
      setBusy(false);
    }
  };
  return (
    <div className="space-y-2">
      <Button type="button" onClick={go} loading={busy} icon={<Gamepad2 className="size-5" aria-hidden />}>
        {busy ? t("switching") : t("playAs", { name: nickname })}
      </Button>
      <ErrorNote>{error}</ErrorNote>
    </div>
  );
}
