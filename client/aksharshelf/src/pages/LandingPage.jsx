import { HeroSection } from "../components/landing/HeroSections";
import CTASection from "../components/landing/CTASection";
import MostPopularBooks from "../components/landing/MostPopularBooks";
import FeaturesSection from "../components/landing/FeatureSections";
import { HOME_SECTIONS } from "../utils/homeSections";

function LandingPage() {
  return (
    <>
      <div id={HOME_SECTIONS.hero} className="scroll-mt-24">
        <HeroSection />
      </div>
      <div id={HOME_SECTIONS.freeBooks} className="scroll-mt-24">
        <MostPopularBooks />
      </div>
      <div id={HOME_SECTIONS.features} className="scroll-mt-24">
        <FeaturesSection />
      </div>
      <div id={HOME_SECTIONS.cta} className="scroll-mt-24">
        <CTASection />
      </div>
    </>
  );
}

export default LandingPage;
