/** Button look for <Link> elements (mirrors the Button component in components/ui). */
const VARIANTS = {
  primary: "bg-gradient-to-b from-[#6aa9f2] to-[#3f7fdc] text-white shadow-[var(--shadow-button)] hover:brightness-105",
  sun: "bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] text-[#4a3505] shadow-[var(--shadow-button)] hover:brightness-105",
  glass: "glass text-white hover:bg-white/15",
  light: "bg-white text-ink border border-slate-200 hover:bg-slate-50 shadow-sm",
} as const;

const SIZES = { sm: "h-10 px-4 text-sm rounded-xl", md: "h-12 px-5 text-base rounded-2xl", lg: "h-14 px-7 text-lg rounded-2xl" } as const;

export function linkBtn(variant: keyof typeof VARIANTS = "primary", size: keyof typeof SIZES = "md") {
  return `inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-semibold tracking-wide transition active:translate-y-[2px] ${VARIANTS[variant]} ${SIZES[size]}`;
}
