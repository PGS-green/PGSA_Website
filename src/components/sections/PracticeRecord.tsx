import { RECORD } from "../../content/site";
import { Container, Hairline } from "../ui";

/**
 * The practice record as a hairline-divided row, not boxed stat tiles.
 *
 * Numbers are rendered as static strings, never counted up. A count-up reads as
 * decoration on a page this quiet, and any animation that fails to fire leaves
 * a wrong number about the practice sitting on screen.
 */
export function PracticeRecord() {
  return (
    <section aria-label="Practice record" className="py-12 sm:py-16">
      <Container>
        <Hairline />
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {RECORD.map((item) => (
            <div
              className="py-6 sm:py-8 pr-6 border-b border-gray-200 md:border-b-0 md:border-r md:last:border-r-0 md:pl-6 md:first:pl-0"
              key={item.label}
            >
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block font-serif text-3xl sm:text-4xl md:text-5xl leading-none tracking-tight text-[#191919]">
                  {item.value}
                </span>
                <span className="block mt-2 text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                  {item.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <Hairline className="hidden md:block" />
      </Container>
    </section>
  );
}
