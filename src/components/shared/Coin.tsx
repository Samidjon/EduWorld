/** EduWorld coin icon (SVG - the coin emoji is missing in some system fonts). */
export function Coin({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: "inline-block", verticalAlign: "-0.15em" }} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#E8A92E" />
      <circle cx="12" cy="12" r="8.5" fill="#FFD76B" stroke="#F3B93E" strokeWidth="1.5" />
      <path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1L12 14.6l-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z" fill="#E8A92E" />
    </svg>
  );
}
