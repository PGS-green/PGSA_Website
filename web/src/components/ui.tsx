import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The theme primitives. Every section and page composes these, so the grammar
 * established on the landing page — uppercase micro-label, serif head, hairline
 * rule, black pill — stays identical everywhere.
 *
 * One measure throughout, so the left and right edges line up down the whole
 * site. Image bands break out of it deliberately.
 */

/**
 * The page measure.
 *
 * Gutters match the navbar's (`px-6 sm:px-10 md:px-14`) so the logo sits on the
 * same vertical line as the content beneath it. The cap is wide because this is
 * a portfolio: at 1024px a 1440px screen gave over 200px of dead margin each
 * side and made every image look small. Running text is narrowed locally with
 * `max-w-xl`/`max-w-2xl` rather than by squeezing the whole page.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-[1400px] mx-auto px-6 sm:px-10 md:px-14 ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
      {children}
    </span>
  );
}

export function Hairline({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-gray-200 w-full ${className}`} />;
}

/**
 * Two-column section head: label + serif title on the left, supporting text or
 * a link on the right. Same 2-up split as the hero panel's top row.
 */
export function SectionHead({
  aside,
  label,
  title,
}: {
  aside?: ReactNode;
  label: string;
  title: ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-16">
      <div>
        <Eyebrow>{label}</Eyebrow>
        <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-tight tracking-tight text-[#191919]">
          {title}
        </h2>
      </div>
      {aside ? (
        <div className="flex items-end text-sm md:text-[15px] text-[#191919]/70 leading-relaxed">
          {aside}
        </div>
      ) : null}
    </div>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "solid",
}: {
  children: ReactNode;
  href: string;
  variant?: "solid" | "ghost";
}) {
  const base =
    "inline-block px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-medium rounded-lg transition-colors duration-200";
  const skin =
    variant === "solid"
      ? "bg-[#191919] text-white hover:bg-[#191919]/90"
      : "border border-gray-300 text-[#191919] hover:bg-[#F4F3F3]";
  return (
    <a className={`${base} ${skin}`} href={href}>
      {children}
    </a>
  );
}

export function TextLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      className="group inline-flex items-center gap-2 text-sm font-medium text-[#191919] hover:text-[#191919]/70 transition-colors duration-200"
      href={href}
    >
      {children}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
    </a>
  );
}

