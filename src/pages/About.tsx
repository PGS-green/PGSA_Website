import { PageHeader } from "../components/PageHeader";
import { ContactBandLight } from "../components/sections/ContactBand";
import { PracticeRecord } from "../components/sections/PracticeRecord";
import { TeamGrid } from "../components/sections/TeamGrid";
import { Container } from "../components/ui";
import { useVisibleProjects } from "../lib/projectStore";

/**
 * Only content the practice has actually published appears here.
 *
 * A "How we work" section used to sit between the record and the team, with
 * four process steps. It was written from scratch rather than taken from the
 * practice's own material, so it has been removed.
 */
export function About() {
  const projects = useVisibleProjects();
  const hero =
    projects.find((project) => project.featured && project.images.length) ??
    projects.find((project) => project.images.length);

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
        {/* Drawn from the live archive rather than a bundled file, so it can
            never point at an asset that has been moved or removed. */}
        <div
          aria-label={hero ? `${hero.name}, ${hero.location}` : undefined}
          className="w-full bg-[#F4F3F3] bg-cover bg-center"
          role={hero ? "img" : undefined}
          style={{
            aspectRatio: "16 / 9",
            backgroundImage: hero?.images[0]
              ? `url(${hero.images[0]})`
              : undefined,
          }}
        />
      </Container>

      <PracticeRecord />

      <TeamGrid />

      <ContactBandLight />
    </>
  );
}
