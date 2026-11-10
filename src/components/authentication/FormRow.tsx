import type { ReactNode } from "react";

/** Label + control + hint/error, wired with ids so screen readers announce errors. */
export function FormRow({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <div id={`${id}-hint`}>{hint}</div>}
      {error && (
        <p id={`${id}-error`} className="text-xs font-bold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria props for an input rendered inside FormRow. */
export function describe(id: string, error: string | undefined, hasHint = false) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
  } as const;
}

export function FormAlert({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
      {children}
    </p>
  );
}
