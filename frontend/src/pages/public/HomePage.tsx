import { ContactSection } from "../../components/home/ContactSection";
import { FAQSection } from "../../components/home/FAQSection";
import { HeroSection } from "../../components/home/HeroSection";
import { PopularCourses } from "../../components/home/PopularCourses";
import { StatsSection } from "../../components/home/StatsSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularCourses />
      <StatsSection />
      <ContactSection />
      <FAQSection />
    </>
  );
}
