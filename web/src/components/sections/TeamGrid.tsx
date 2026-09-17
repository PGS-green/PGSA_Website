import type { TeamMember } from "../../content/team";
import { PRINCIPALS, STUDIO } from "../../content/team";
import { Figure } from "../Figure";
import { Container, Hairline, SectionHead } from "../ui";

/**
 * Principals get a portrait, a role, and their qualifications; the rest of the
 * studio is a tighter grid of portrait and name only.
 *
 * One member has no portrait in the archive. The old site filled that slot with
 * the company logo, which reads as a missing-image placeholder; this renders a
 * typographic monogram instead so the card still looks deliberate.
 */
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="w-full bg-[#F4F3F3] flex items-center justify-center"
      style={{ aspectRatio: "1 / 1" }}
    >
      <span className="font-serif text-4xl sm:text-5xl text-[#191919]/30 tracking-tight">
        {initials}
      </span>
    </div>
  );
}

function Portrait({ member, sizes }: { member: TeamMember; sizes: string }) {
  if (!member.portrait) return <Monogram name={member.name} />;
  return (
    <Figure
      alt={member.portrait.alt}
      id={member.portrait.id}
      ratio="1 / 1"
      sizes={sizes}
    />
  );
}

export function TeamGrid() {
  return (
    <section className="py-16 sm:py-24" id="team">
      <Container>
        <SectionHead
          aside={
            <p>
              Architects, engineers, and the administrative team who deliver
              projects day to day, across the Trichy and Chennai studios.
            </p>
          }
          label="Studio"
          title="The team behind the work."
        />

        <div className="mt-10 sm:mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPALS.map((member) => (
            <article key={member.slug}>
              <Portrait
                member={member}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="pt-4">
                <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-[#191919]">
                  {member.prefix ? `${member.prefix} ` : ""}
                  {member.name}
                </h3>
                <p className="mt-1 text-sm text-[#191919]/60">
                  {member.role} — {member.office}
                </p>
                {member.bio ? (
                  <p className="mt-3 text-sm text-[#191919]/70 leading-relaxed">
                    {member.bio}
                  </p>
                ) : null}
              </div>
              <Hairline className="mt-5" />
            </article>
          ))}
        </div>

        <div className="mt-14 sm:mt-20">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
            The studio
          </span>
          <div className="mt-6 grid gap-x-5 gap-y-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {STUDIO.map((member) => (
              <article key={member.slug}>
                <Portrait
                  member={member}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <h3 className="pt-3 text-sm font-medium text-[#191919]">
                  {member.prefix ? `${member.prefix} ` : ""}
                  {member.name}
                </h3>
                <p className="text-sm text-[#191919]/60">{member.role}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
