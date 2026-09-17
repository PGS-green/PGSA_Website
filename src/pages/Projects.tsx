import { useMemo, useState } from "react";
import Masonry from "../components/Masonry";
import type { MasonryItem } from "../components/Masonry";
import { PageHeader } from "../components/PageHeader";
import { ContactBandLight } from "../components/sections/ContactBand";
import { Container, Hairline } from "../components/ui";
import { projectTypes } from "../content/projects";
import { useProjectState, useVisibleProjects } from "../lib/projectStore";

/**
 * The archive.
 *
 * Every image the practice has uploaded, not one cover per project — an archive
 * exists to be browsed, and a four-row grid of covers hides most of the work.
 * Tiles keep their true proportions, so elevations, interiors and portraits all
 * read correctly side by side.
 *
 * Filters are built from the programme types actually present, so the practice
 * never sees a chip that leads nowhere after editing the archive.
 */
export function Projects({ query }: { query: URLSearchParams }) {
  const projects = useVisibleProjects();
  const { loading, error } = useProjectState();

  const active = query.get("type");
  const types = projectTypes(projects);

  const shown = useMemo(
    () => (active ? projects.filter((p) => p.type === active) : projects),
    [projects, active],
  );

  /** Flattened: one tile per image, carrying its parent project's details. */
  const items = useMemo<MasonryItem[]>(
    () =>
      shown.flatMap((project) =>
        project.images.map((img, index) => ({
          id: `${project.id}-${index}`,
          img,
          url: `/projects/${project.id}`,
          label: project.name,
          meta: `${project.location} — ${project.type}`,
        })),
      ),
    [shown],
  );

  const [gridHeight, setGridHeight] = useState(0);

  const imageCount = items.length;
  const projectCount = shown.length;

  return (
    <>
      <PageHeader
        intro={
          <p>
            Residences, hospitality, commercial buildings, institutions, and
            interiors across Tamil Nadu and nearby regions.
          </p>
        }
        title="Our selected work."
      />

      <Container>
        <Hairline />
        <div className="py-5 flex flex-wrap items-center gap-2">
          <a
            className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
              active
                ? "bg-[#F4F3F3] text-[#191919]/70 hover:bg-[#eaeaea]"
                : "bg-[#191919] text-white"
            }`}
            href="/projects"
          >
            All work
          </a>
          {types.map((type) => (
            <a
              className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                active === type
                  ? "bg-[#191919] text-white"
                  : "bg-[#F4F3F3] text-[#191919]/70 hover:bg-[#eaeaea]"
              }`}
              href={`/projects?type=${encodeURIComponent(type)}`}
              key={type}
            >
              {type}
            </a>
          ))}

          {projectCount > 0 && (
            <span className="ml-auto text-[11px] uppercase tracking-[0.2em] text-[#191919]/40 font-medium">
              {projectCount} project{projectCount === 1 ? "" : "s"} ·{" "}
              {imageCount} image{imageCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <Hairline />
      </Container>

      <Container className="py-10 sm:py-14">
        {error ? (
          <p className="mb-8 text-sm text-[#191919]/60">
            Showing the last published set — the live archive could not be
            reached.
          </p>
        ) : null}

        {loading && projects.length === 0 ? (
          <p className="py-16 text-sm text-[#191919]/60">Loading the archive…</p>
        ) : items.length === 0 ? (
          <p className="py-16 text-sm text-[#191919]/60">
            No projects in this category yet.
          </p>
        ) : (
          <div
            style={{
              height: gridHeight ? `${Math.ceil(gridHeight)}px` : undefined,
            }}
          >
            {/* Keyed on the filter so the grid re-animates when it changes. */}
            <Masonry
              animateFrom="bottom"
              blurToFocus
              duration={0.6}
              ease="power3.out"
              hoverScale={0.98}
              items={items}
              key={active ?? "all"}
              onHeight={setGridHeight}
              scaleOnHover
              stagger={0.03}
            />
          </div>
        )}
      </Container>

      {/* A plain index under the gallery: the grid shows the work, this says
          what each project actually is. */}
      {shown.length > 0 && (
        <Container className="pb-16 sm:pb-24">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
            Index
          </span>
          <div className="mt-6">
            <Hairline />
            {shown.map((project) => (
              <a
                className="group block py-5 border-b border-gray-200"
                href={`/projects/${project.id}`}
                key={project.id}
              >
                <div className="grid md:grid-cols-[1fr_auto] gap-x-8 gap-y-1 items-baseline">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#191919]">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#191919]/60 leading-relaxed max-w-2xl">
                      {project.description}
                    </p>
                  </div>
                  <span className="text-sm text-[#191919]/50 whitespace-nowrap">
                    {project.location} · {project.status} · {project.year}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      )}

      <ContactBandLight />
    </>
  );
}
