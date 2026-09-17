import { HERO } from "../content/site";
import { BoomerangVideoBg } from "./BoomerangVideoBg";
import { InfoPanel } from "./InfoPanel";

/**
 * The whole first viewport: looping media underneath, copy at the top, info
 * panel pushed to the bottom edge by `mt-auto`.
 *
 * This boomerang treatment is a landing-page-only device. Inner pages inherit
 * the type, chrome, and panel patterns with a static or empty hero slot.
 */
export function Hero() {
  return (
    <section
      className="relative flex flex-col items-center overflow-hidden h-screen"
      id="top"
    >
      <BoomerangVideoBg />

      <div className="relative z-10 flex flex-col items-center text-center pt-24 sm:pt-26 md:pt-32 px-4 sm:px-6">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tighter text-[#191919] font-normal">
          {HERO.headline[0]}
          <br />
          {HERO.headline[1]}
        </h1>

        {/* No CTA here: the navbar's "Start A Project" sits in the same
            viewport and follows the reader down the page, so a second copy
            three lines below it was the same button twice on one screen. */}
        <p className="max-w-sm sm:max-w-md mt-5 sm:mt-6 md:mt-8 text-sm md:text-base text-[#191919]/70 leading-relaxed">
          {HERO.subcopy}
        </p>
      </div>

      <div className="relative z-10 mt-auto w-full flex justify-center">
        <InfoPanel />
      </div>
    </section>
  );
}
