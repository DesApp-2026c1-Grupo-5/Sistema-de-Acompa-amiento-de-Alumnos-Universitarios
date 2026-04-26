import { useState } from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import HeroSection from "../../components/landing/HeroSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import FunctionalitiesSection from "../../components/landing/FunctionalitiesSection";
import Footer from "../../components/landing/Footer";

const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`landing-page ${isDarkMode ? "dark-mode" : ""}`}>
      <LandingNavbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main>
        <HeroSection />
        <FeaturesSection />
        <FunctionalitiesSection />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;