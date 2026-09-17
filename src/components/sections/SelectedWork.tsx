import { useMemo, useState } from "react";
import Masonry from "../Masonry";
import type { MasonryItem } from "../Masonry";
import type { Project } from "../../content/projects";
import { useVisibleProjects } from "../../lib/projectStore";
import { Container, Hairline, SectionHead, TextLink } from "../ui";

/** Programme types listed for running prose. */
function listTypes(types: string[]): string {
  const names = types.map((t) => t.toLowerCase());
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/**
 * Work shown at the scale it deserves: the featured project runs full-bleed
 * across the viewport, then the rest fill a masonry grid that keeps each
 * image's real proportions.
 *
 * Everything here comes from the `projects` table, so adding a project in the
 * admin changes this section with no code edit.
 */
export function SelectedWork() {
  const projects = useVisibleProjects();
  const [gridHeight, setGridHeight] = useState(0);

  // The practice picks the lead by ticking "featured" in the admin.
  const lead: Project | undefined =
    projects.find((project) => project.featured) ?? projects[0];

  const gallery = useMemo(
    () => projects.filter((project) => project.id !== lead?.id),
    [projects, lead?.id],
  );

  const items = useMemo<MasonryItem[]>(
    () =>
      gallery
        .filter((project) => project.images.length > 0)
        .map((project) => ({
          id: project.id,
          img: project.images[0],
          url: `/projects/${project.id}`,
          label: project.name,
          meta: `${project.location} — ${project.type}`,
        })),
    [gallery],
  );

  const summary = useMemo(() => {
    const types = [...new Set(projects.map((p) => p.type))];
    if (!projects.length) return "";
    return `${projects.length} project${projects.length === 1 ? "" : "s"} from the archive, across ${listTypes(types)}.`;
  }, [projects]);

  if (!lead) return null;

  return (
    <section className="py-16 sm:py-24 md:py-32" id="work">
      <Container>
        <SectionHead
          aside={summary ? <p>{summary}</p> : undefined}
          label="Selected work"
          title="Our selected work."
        />
      </Container>

      {/* Full-bleed lead. Breaks the measure on purpose. */}
      <figure className="mt-10 sm:mt-14 md:mt-20">
        <div
          className="w-full bg-[#F4F3F3] bg-cover bg-center"
          role="img"
          aria-label={lead.name}
          style={{
            aspectRatio: "21 / 9",
            backgroundImage: lead.images[0]
              ? `url(${lead.images[0]})`
              : undefined,
          }}
        />
        <Container>
          <figcaption className="pt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
            <span className="font-medium text-[#191919]">{lead.name}</span>
            <span className="text-[#191919]/60">
              {lead.location} — {lead.type}
            </span>
          </figcaption>
          <Hairline className="mt-4" />
        </Container>
      </figure>

      {items.length > 0 && (
        <Container className="mt-10 sm:mt-14">
          {/* Tiles are absolutely positioned, so the wrapper takes the height
              the layout reports back. */}
          <div
            style={{ height: gridHeight ? `${Math.ceil(gridHeight)}px` : undefined }}
          >
            <Masonry
              animateFrom="bottom"
              blurToFocus
              duration={0.6}
              ease="power3.out"
              hoverScale={0.98}
              items={items}
              onHeight={setGridHeight}
              scaleOnHover
              stagger={0.05}
            />
          </div>
        </Container>
      )}

      <Container className="mt-10 sm:mt-14">
        <TextLink href="/projects">Explore the project archive</TextLink>
      </Container>
    </section>
  );
}
