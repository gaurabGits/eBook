import  { HeroSection } from "../components/landing/Hero Section/HeroSections";
import FeaturesSection from "../components/landing/FeatureSections";
import CTASection from "../components/landing/CTASection";
import { HOME_SECTIONS } from "../utils/homeSections";
import RecommendedForYou from "../components/landing/RecommendedForYou";

function LandingPage() {
  return (
    <>
      <div id={HOME_SECTIONS.hero} className="scroll-mt-24">
        <HeroSection />
      </div>
      <div id={HOME_SECTIONS.freeBooks} className="scroll-mt-24">
        <RecommendedForYou />
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
