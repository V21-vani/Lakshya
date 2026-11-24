// Hand-drawn style line illustrations used as decoration (aria-hidden).
const INK = '#1C1B19';
const stroke = { stroke: INK, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

// Polka-dot pattern for the coloured blocks.
function Dots({ id, fill }) {
  return (
    <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill={fill} />
      <circle cx="5" cy="5" r="2.6" fill={INK} />
      <circle cx="14" cy="13" r="2.2" fill={INK} />
    </pattern>
  );
}

export function Squiggle({ className = '' }) {
  return (
    <svg viewBox="0 0 120 30" className={className} aria-hidden="true">
      <path {...stroke} d="M2 20c10 0 10-16 20-16s8 20 18 20 10-18 20-18 9 16 19 16 10-12 20-12 9 8 19 8" />
    </svg>
  );
}

/** Left scene: speech bubble, dotted block, framed growth arrow. */
export function DoodleLeft({ className = '' }) {
  return (
    <svg viewBox="0 0 300 330" className={className} aria-hidden="true">
      <defs><Dots id="dots-sunny" fill="#FFE08A" /></defs>
      <path {...stroke} d="M20 40c12-2 14-20 26-20s10 22 22 20 12-24 24-22 10 18 22 16" />
      <circle {...stroke} cx="170" cy="30" r="3" />
      {/* speech bubble */}
      <rect {...stroke} x="70" y="70" width="110" height="80" fill="white" />
      <path {...stroke} d="M90 150 l-6 28 l26 -28" fill="white" />
      <path {...stroke} d="M95 100h60M95 122h44" />
      <circle {...stroke} cx="228" cy="150" r="5" />
      {/* dotted block */}
      <rect x="40" y="190" width="72" height="128" fill="url(#dots-sunny)" stroke={INK} strokeWidth="1.5" />
      {/* framed arrow */}
      <rect {...stroke} x="128" y="238" width="80" height="80" fill="white" />
      <path {...stroke} d="M150 298c10-8 22-26 30-42M168 254l12 2 2 12" />
      <path {...stroke} d="M222 222c6-6 14-6 20 0s14 6 20 0" />
      <path {...stroke} d="M0 318h300" />
    </svg>
  );
}

/** Right scene: chat bubble, laptop on a box with a goal flag, dotted pillar. */
export function DoodleRight({ className = '' }) {
  return (
    <svg viewBox="0 0 300 330" className={className} aria-hidden="true">
      <defs><Dots id="dots-peach" fill="#FFC47E" /></defs>
      <path {...stroke} d="M190 40c10 0 12-16 22-16s10 20 22 18 10-14 20-14" />
      {/* small chat bubble */}
      <rect {...stroke} x="40" y="40" width="62" height="42" fill="white" />
      <path {...stroke} d="M52 56h38M52 68h24M64 82l-4 14 14-14" />
      <circle {...stroke} cx="130" cy="110" r="3" />
      {/* box with laptop */}
      <rect {...stroke} x="92" y="200" width="96" height="118" fill="white" />
      <path {...stroke} d="M104 200l14-46h62l-12 46z" fill="#E8F0C8" />
      <path {...stroke} d="M132 176l18 0" />
      {/* goal flag */}
      <path {...stroke} d="M216 118v82" />
      <path {...stroke} d="M216 120h40l-10 14 10 14h-40" fill="#FFE08A" />
      <circle {...stroke} cx="216" cy="206" r="6" fill="white" />
      {/* dotted pillar */}
      <rect x="206" y="220" width="64" height="98" fill="url(#dots-peach)" stroke={INK} strokeWidth="1.5" />
      <path {...stroke} d="M30 160c6-6 14-6 20 0s14 6 20 0" />
      <path {...stroke} d="M0 318h300" />
    </svg>
  );
}
