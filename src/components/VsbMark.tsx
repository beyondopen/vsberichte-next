import type { SVGProps } from "react";

/**
 * Verfassungsschutzberichte.de — Logo-Mark
 * Berichtsstapel mit hervorgehobener Volltext-Treffer-Zeile.
 *
 * Neutral (Stapel + Linien) = currentColor → erbt text-gray-900 / dark:text-gray-100.
 * Flächenfüllung der Seiten = --vsb-surface (auf dem Eltern-Element auf die
 *   Hintergrundfarbe setzen, damit sich die Seiten korrekt überlappen).
 * Highlight = #facc15 (yellow-400, eure Such-Hervorhebung aus globals.css),
 *   Schrift darauf = #111827 (gray-900) in beiden Modi.
 *
 * Beispiel:
 *   <span className="[--vsb-surface:#fff] dark:[--vsb-surface:#030712]">
 *     <VsbMark className="h-7 w-auto" />
 *   </span>
 */
export function VsbMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 110 130"
      fill="none"
      role="img"
      aria-label="Verfassungsschutzberichte.de"
      {...props}
    >
      <rect x="3" y="30" width="75" height="94" rx="11" fill="var(--vsb-surface, #ffffff)" stroke="currentColor" strokeWidth="5" opacity="0.36" />
      <rect x="18" y="17" width="75" height="94" rx="11" fill="var(--vsb-surface, #ffffff)" stroke="currentColor" strokeWidth="5" opacity="0.66" />
      <rect x="32" y="3" width="75" height="98" rx="11" fill="var(--vsb-surface, #ffffff)" stroke="currentColor" strokeWidth="5" />
      {/* gelbes Such-Highlight hinter der Trefferzeile */}
      <rect x="43" y="52" width="51" height="15" rx="3.5" fill="#facc15" />
      <rect x="46" y="27" width="47" height="6" rx="3" fill="currentColor" />
      <rect x="46" y="42" width="31" height="6" rx="3" fill="currentColor" />
      <rect x="46" y="57" width="42.3" height="6" rx="3" fill="#111827" />
      <rect x="46" y="72" width="24.4" height="6" rx="3" fill="currentColor" />
    </svg>
  );
}

export default VsbMark;
