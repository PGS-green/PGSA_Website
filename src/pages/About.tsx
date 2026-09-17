import { Figure } from "../components/Figure";
import { PageHeader } from "../components/PageHeader";
import { ContactBandLight } from "../components/sections/ContactBand";
import { PracticeRecord } from "../components/sections/PracticeRecord";
import { TeamGrid } from "../components/sections/TeamGrid";
import { Container } from "../components/ui";

/**
 * Only content the practice has actually published appears here.
 *
 * A "How we work" section used to sit between the record and the team, with
 * four process steps. It was written from scratch rather than taken from the
 * practice's own material, so it has been removed.
 */
export function About() {
  return (
    <>
      <PageHeader
        intro={
          <p>
            P.G. Sivakumaar &amp; Associates has practised from Trichy since
            1984, with a second studio in Chennai. The work spans residences,
            healthcare, education, commercial buildings, interiors, and venues.
          </p>
        }
        label="About the practice"
        title="A practice built on delivery, not just drawings."
      />

      <Container>
        <Figure
          alt="Al Munawara International School campus frontage"
          id="projects/7-1"
          priority
          ratio="16 / 9"
          sizes="100vw"
        />
      </Container>

      <PracticeRecord />

      <TeamGrid />

      <ContactBandLight />
    </>
  );
}
