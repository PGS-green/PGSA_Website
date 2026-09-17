import { Figure } from "../Figure";
import { ButtonLink, Container, Eyebrow } from "../ui";

/**
 * The one place on the page where the serif runs at near-hero scale again.
 * Text left, a single tall image right — no stacked or offset image collage.
 */
export function StudioStatement() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-[#F4F3F3]" id="studio">
      <Container>
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-16 items-center">
          <div>
            <Eyebrow>Studio philosophy</Eyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-serif font-normal leading-[1.15] tracking-tight text-[#191919]">
              Clarity, restraint, and responsibility.
            </h2>
            <p className="mt-6 text-sm md:text-base text-[#191919]/70 leading-relaxed max-w-md">
              PGSA&rsquo;s trust is built through a long practice history, a
              broad project archive, and a grounded approach to design,
              sustainability, and delivery.
            </p>
            <p className="mt-4 text-sm md:text-base text-[#191919]/70 leading-relaxed max-w-md">
              The practice works across major cities and smaller towns, on
              buildings that have to keep performing long after handover.
            </p>
            <div className="mt-8">
              <ButtonLink href="/about">About the practice</ButtonLink>
            </div>
          </div>

          <Figure
            alt="MR Hospital, a healthcare project by PGSA"
            id="projects/9-1"
            ratio="3 / 4"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </Container>
    </section>
  );
}
