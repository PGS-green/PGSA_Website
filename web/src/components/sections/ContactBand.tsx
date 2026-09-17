import { CONTACT } from "../../content/site";
import { ButtonLink, Container, Eyebrow } from "../ui";

/**
 * Closing call to action. Inverted so it reads as the end of the page.
 *
 * The `id` is "enquiry" rather than "contact" so an in-page anchor can never be
 * confused with the /contact route.
 */
export function ContactBand() {
  return (
    <section className="bg-[#191919] text-white py-16 sm:py-24 md:py-28" id="enquiry">
      <Container>
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-end">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-medium">
              Project enquiry
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-tight tracking-tight">
              Have a site, brief, or <br className="hidden sm:block" />
              collaboration in mind?
            </h2>
          </div>
          <div>
            <p className="text-sm md:text-[15px] text-white/70 leading-relaxed">
              Reach the Trichy or Chennai office directly with a project brief,
              collaboration note, or portfolio submission.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                className="inline-block px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-[#191919] text-sm font-medium rounded-lg hover:bg-white/90 transition-colors duration-200"
                href="/contact"
              >
                Start a conversation
              </a>
              <a
                className="text-sm text-white/70 hover:text-white transition-colors duration-200"
                href={`mailto:${CONTACT.email}`}
              >
                {CONTACT.email}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** The same band on a light ground, for inner pages that end on white. */
export function ContactBandLight() {
  return (
    <section className="py-16 sm:py-24 border-t border-gray-200">
      <Container>
        <Eyebrow>Project enquiry</Eyebrow>
        <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-tight tracking-tight text-[#191919]">
          Have a site, brief, or collaboration in mind?
        </h2>
        <div className="mt-8">
          <ButtonLink href="/contact">Start a conversation</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
