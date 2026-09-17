import { Hero } from "../components/Hero";
import { ContactBand } from "../components/sections/ContactBand";
import { PracticeRecord } from "../components/sections/PracticeRecord";
import { SelectedWork } from "../components/sections/SelectedWork";
import { StudioStatement } from "../components/sections/StudioStatement";

export function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <PracticeRecord />
      <StudioStatement />
      <ContactBand />
    </>
  );
}
