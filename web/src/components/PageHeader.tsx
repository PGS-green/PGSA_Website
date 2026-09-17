import type { ReactNode } from "react";
import { Container, Eyebrow } from "./ui";

/**
 * The inner-page counterpart to the hero.
 *
 * Deliberately has no media slot: the boomerang video is a landing-page device,
 * and repeating a full-bleed loop on every page would bury the content it is
 * supposed to introduce. Pages open on type and whitespace, then go straight to
 * their own imagery.
 */
export function PageHeader({
  intro,
  label,
  title,
}: {
  intro?: ReactNode;
  /** Optional: omit where the title already says what the page is. */
  label?: string;
  title: ReactNode;
}) {
  return (
    <header className="pt-32 sm:pt-40 md:pt-48 pb-12 sm:pb-16">
      <Container>
        {label ? <Eyebrow>{label}</Eyebrow> : null}
        <h1
          className={`font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tighter text-[#191919] font-normal max-w-3xl ${
            label ? "mt-4" : ""
          }`}
        >
          {title}
        </h1>
        {intro ? (
          <div className="mt-6 max-w-xl text-sm md:text-base text-[#191919]/70 leading-relaxed">
            {intro}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
