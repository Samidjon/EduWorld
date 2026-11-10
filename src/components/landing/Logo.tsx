/** EduWorld wordmark: a small globe with an orbiting star + rounded "Edu" / "World". */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id="ew-globe" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#A8D8F0" />
          <stop offset="55%" stopColor="#5799E8" />
          <stop offset="100%" stopColor="#3B62C4" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="26" r="16" fill="url(#ew-globe)" />
      {/* continents */}
      <path d="M13 21c3-3 7-2 8 1s-2 4-4 5-4 0-5-2 0-3 1-4z" fill="#9BDDB7" />
      <path d="M25 30c2-2 6-2 7 1s-1 5-4 5-4-4-3-6z" fill="#9BDDB7" />
      <path d="M24 13c3 0 6 2 6 4s-3 2-5 1-3-5-1-5z" fill="#9BDDB7" />
      {/* orbit */}
      <ellipse cx="23" cy="26" rx="21" ry="7" transform="rotate(-20 23 26)" fill="none" stroke="#FFF8EA" strokeWidth="2" strokeLinecap="round" strokeDasharray="70 14" opacity="0.9" />
      {/* star */}
      <path d="M39 4l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#FFD76B" stroke="#F2B636" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ tone = "dark", className, size = 36 }: { tone?: "dark" | "light"; className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span className="font-display text-2xl font-bold leading-none tracking-tight">
        <span className={tone === "dark" ? "text-sun" : "text-brand-blue"}>Edu</span>
        <span className={tone === "dark" ? "text-white" : "text-ink"}>World</span>
      </span>
    </span>
  );
}
