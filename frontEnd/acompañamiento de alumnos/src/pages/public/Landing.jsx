import { useState } from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import HeroSection from "../../components/landing/HeroSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import FunctionalitiesSection from "../../components/landing/FunctionalitiesSection";
import Footer from "../../components/landing/Footer";
import styles from "../../styles/landing.module.css";

const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`${styles.landingPage}${isDarkMode ? ' ' + styles.darkMode : ''}`}>
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