import Hero from "../../sections/home/Hero";
import StatisticSection from "../../sections/home/StatisticSection";
import PartnerSection from "../../sections/home/PartnerSection";
import IntroSection from "../../sections/home/IntroSection";
import CtaSection from "../../sections/home/CtaSection";
import AktaSection from "../../sections/home/AktaSection";
import LatestVacanciesSection from "../../sections/home/LatestVacanciesSection";

const LandingHomePage = () => {
  return (
    <div>
      <Hero />
      <StatisticSection />
      <IntroSection />
      <AktaSection />
      <PartnerSection />
      <LatestVacanciesSection />
      <CtaSection />
    </div>
  );
};

export default LandingHomePage;
