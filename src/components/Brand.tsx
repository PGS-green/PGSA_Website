import { useState } from "react";
import { BRAND } from "../content/site";

/**
 * The PGSA logotype.
 *
 * Renders the real brand asset from `public/brand/`, and falls back to a plain
 * type lockup if the file is missing so the header never shows a broken image.
 * Drop `pgsa-logo.png` (full lockup, with the "Architecture + Interior Design"
 * line) into that folder and this picks it up with no code change.
 */

export const LOGO_SRC = "/brand/pgsa-logo.png";

/** Lockup without the tagline, for tight spots like the navbar. */
export const WORDMARK_SRC = "/brand/pgsa-wordmark.png";

export function Brand({
  className = "",
  src = WORDMARK_SRC,
  /** Rendered instead of the image if the file isn't there yet. */
  fallbackSize = "text-base",
}: {
  className?: string;
  src?: string;
  fallbackSize?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`font-semibold ${fallbackSize} tracking-tight text-[#191919]`}
      >
        {BRAND.short}
      </span>
    );
  }

  return (
    <img
      alt={BRAND.name}
      className={`w-auto ${className}`}
      onError={() => setFailed(true)}
      src={src}
    />
  );
}
