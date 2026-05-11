import styles from "../../styles/landing.module.css";

const LandingNavbar = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className={styles.landingNavbar}>
      <div className={styles.landingNavbar__content}>
        <div className={styles.landingLogo}>
          <div className={styles.landingLogo__icon}>🎓</div>
          <span>SIVA UNAHUR</span>
        </div>

        <nav className={styles.landingNavbar__actions}>
          <button
            className={styles.themeButton}
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {isDarkMode ? "☀" : "☾"}
          </button>

          <a href="/login" className={styles.loginLink}>
            Iniciar sesión
          </a>

          <a href="/login" className={styles.registerButton}>
            Registrarse
          </a>
        </nav>
      </div>
    </header>
  );
};

export default LandingNavbar;