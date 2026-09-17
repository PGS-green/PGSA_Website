/**
 * Site-wide chrome and landing-page copy.
 *
 * Content is ported from pgsa-web/src/lib/site.ts and content/practiceAreas.ts
 * so the theme is judged against the practice's real words, not lorem.
 */

export const BRAND = {
  name: "P.G. Sivakumaar & Associates",
  short: "PGSA",
  tagline: "Architecture and sustainable design",
  established: 1984,
} as const;

export const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
] as const;

export const CTA_LABEL = "Start A Project";

export const HERO = {
  /** Rendered as two lines of the display serif. */
  headline: ["Architecture that", "endures."],
  subcopy:
    "A Tamil Nadu architecture practice since 1984 — residences, hospitals, institutions, and interiors shaped by climate, context, and everyday life.",
} as const;

export const PANEL = {
  label: "What do we do?",
  /** Line break is applied from the `sm` breakpoint up. */
  headline: ["Buildings that", "age well"],
  body: "Architecture, interiors, and planning for clients across Tamil Nadu. Buildings designed around how people actually use them, detailed to be built, and made to last.",
} as const;

export const RECORD = [
  { value: "1984", label: "Practice established" },
  { value: "1000+", label: "Buildings designed" },
  { value: "6", label: "Core typologies" },
  { value: "2", label: "Studio locations" },
] as const;

export interface Office {
  city: string;
  kind: string;
  address: string;
  phones: readonly string[];
  mapQuery: string;
}

export const OFFICES: readonly Office[] = [
  {
    city: "Trichy",
    kind: "Main office",
    address:
      'No 23, "The West", 3rd Floor, Pudukkottai Main Road, TVS Tollgate, Opposite Kallukuzhi Road, Near Sethuram Pillai Colony, Trichy - 620 020, Tamil Nadu, India.',
    phones: ["0431-2312668", "0431-2313668"],
    mapQuery: "P.G. Sivakumaar & Associates Trichy",
  },
  {
    city: "Chennai",
    kind: "Branch office",
    address:
      "#2, 2T, 3rd Floor, Shivaji's Maniram Apartment, Gandhimandapam Road, Kotturpuram, Chennai - 600 085, Tamil Nadu, India.",
    phones: [],
    mapQuery: "P.G.SIVAKUMAAR & ASSOCIATES Kotturpuram Chennai",
  },
] as const;

export const CONTACT = {
  email: "archpgs@gmail.com",
  facebook: "https://www.facebook.com/pgsarchitects",
  facebookHandle: "pgsarchitects",
} as const;

/** Phone numbers are displayed with dashes but dialled without. */
export function telHref(phone: string): string {
  return `tel:+91${phone.replace(/\D/g, "")}`;
}

export function mapHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
