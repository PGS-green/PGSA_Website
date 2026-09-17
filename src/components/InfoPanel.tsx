import { PANEL } from "../content/site";
import { Eyebrow } from "./ui";

/**
 * The "what do we do?" panel, anchored to the bottom of the first viewport.
 * It is deliberately bottomless — no bottom border, no radius — so it reads as
 * a sheet sliding up over the hero rather than a card floating on it.
 *
 * Measure and gutters match `Container`, so the panel's edges sit on the same
 * vertical lines as every section below it.
 */
export function InfoPanel() {
  return (
    <div className="w-full max-w-[1400px] px-6 sm:px-10 md:px-14">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 border-b-0 py-8 sm:py-12 md:py-16 px-5 sm:px-8 md:px-12 shadow-sm">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-16">
          <div>
            <Eyebrow>{PANEL.label}</Eyebrow>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-normal leading-tight tracking-tight text-[#191919]">
              {PANEL.headline[0]} <br className="hidden sm:block" />
              {PANEL.headline[1]}
            </h2>
          </div>

          <div className="flex items-end">
            <p className="text-sm md:text-[15px] text-[#191919]/70 leading-relaxed">
              {PANEL.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
