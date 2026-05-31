import LandingNavbar from "../../components/landing/LandingNavbar";
import HeroSection from "../../components/landing/HeroSection";
import FeaturesSection from "../../components/landing/FeaturesSection";
import FunctionalitiesSection from "../../components/landing/FunctionalitiesSection";
import Footer from "../../components/landing/Footer";
import styles from "../../styles/landing.module.css";

const Landing = () => {
  return (
    <div className={styles.landingPage}>
      <LandingNavbar />

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