import styles from "../../styles/landing.module.css";

const LandingNavbar = () => {
  return (
    <header className={styles.landingNavbar}>
      <div className={styles.landingNavbar__content}>
        <div className={styles.landingLogo}>
          <div className={styles.landingLogo__icon}>🎓</div>
          <span>SIVA UNAHUR</span>
        </div>

        <nav className={styles.landingNavbar__actions}>
          <a href="/login" className={styles.loginLink}>
            Iniciar sesión
          </a>

          <a href="/login?tab=register" className={styles.registerButton}>
            Registrarse
          </a>
        </nav>
      </div>
    </header>
  );
};

export default LandingNavbar;