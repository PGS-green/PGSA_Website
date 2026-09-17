import { PageHeader } from "../components/PageHeader";
import { Container, Hairline, SectionHead } from "../components/ui";
import { CONTACT } from "../content/site";

/**
 * Audiences, not vacancies.
 *
 * Ported verbatim from pgsa-web/src/app/careers/page.tsx. An earlier version of
 * this page listed four specific openings — seniority, studio, responsibilities
 * — that were invented. The practice publishes no vacancy list, and inventing
 * one risks somebody applying for a job that does not exist.
 */
const AUDIENCES = [
  {
    audience: "Architects",
    title: "Studio roles",
    body: "For architects interested in residential, healthcare, commercial, institutional, and sustainable design work.",
  },
  {
    audience: "Students",
    title: "Internships",
    body: "For architecture students seeking exposure to drawings, design development, site coordination, and client-facing practice.",
  },
  {
    audience: "Collaborators",
    title: "Specialists and vendors",
    body: "For consultants, vendors, and collaborators who support long-term project delivery.",
  },
] as const;

const MAILTO = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
  "Careers or Internship Enquiry",
)}`;

export function Careers() {
  return (
    <>
      <PageHeader
        intro={
          <p>
            Architecture students, young professionals, consultants, and
            collaborators can use this page to understand how to approach the
            studio.
          </p>
        }
        label="Careers and internships"
        title="A clearer route for people who want to work with the studio."
      />

      <section className="pb-16 sm:pb-24">
        <Container>
          <SectionHead
            aside={
              <p>
                The practice does not publish a standing vacancy list.
                Applications are read year-round.
              </p>
            }
            label="Who we hear from"
            title="Three routes into the studio."
          />

          <div className="mt-10 sm:mt-14">
            <Hairline />
            {AUDIENCES.map((item) => (
              <div
                className="py-6 sm:py-8 border-b border-gray-200 grid md:grid-cols-[10rem_1fr] gap-x-8 gap-y-2"
                key={item.audience}
              >
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                  {item.audience}
                </span>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#191919]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#191919]/70 leading-relaxed max-w-2xl">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                How to apply
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-serif font-normal leading-tight tracking-tight text-[#191919]">
                Send a concise note and a portfolio.
              </h2>
            </div>
            <div className="text-sm md:text-[15px] text-[#191919]/70 leading-relaxed">
              <p>
                Include your role of interest, availability, preferred office
                location, portfolio or work samples, and any relevant
                experience.
              </p>
              <a
                className="mt-6 inline-block px-6 sm:px-8 py-3 sm:py-3.5 bg-[#191919] text-white text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors duration-200"
                href={MAILTO}
              >
                Email the studio
              </a>
              <a
                className="mt-4 block text-sm text-[#191919] underline underline-offset-4 decoration-gray-300 hover:decoration-[#191919] transition-colors duration-200"
                href={`mailto:${CONTACT.email}`}
              >
                {CONTACT.email}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
