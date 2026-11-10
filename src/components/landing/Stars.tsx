/** Deterministic twinkling star field (same output on server and client). */
const STARS = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 37.7 + 11) % 100;
  const y = (i * 23.3 + (i % 7) * 9) % 100;
  const r = i % 5 === 0 ? 1.6 : i % 3 === 0 ? 1.1 : 0.7;
  const delay = (i % 9) * 0.35;
  return { x, y, r, delay };
});

export function Stars({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, animationDelay: `${s.delay}s`, boxShadow: s.r > 1.5 ? "0 0 8px 2px rgb(255 248 234 / 0.6)" : undefined }}
        />
      ))}
    </div>
  );
}
