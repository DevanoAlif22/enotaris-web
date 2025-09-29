import Hero from "../../sections/home/Hero";
import StatisticSection from "../../sections/home/StatisticSection";
import BlogSection from "../../sections/home/BlogSection";
import PartnerSection from "../../sections/home/PartnerSection";
import IntroSection from "../../sections/home/IntroSection";
import CtaSection from "../../sections/home/CtaSection";
import AktaSection from "../../sections/home/AktaSection";

const LandingHomePage = () => {
  return (
    <div>
      <Hero />
      <StatisticSection />
      <IntroSection />
      <AktaSection />
      <PartnerSection />
      <BlogSection />
      <CtaSection />
    </div>
  );
};

export default LandingHomePage;
