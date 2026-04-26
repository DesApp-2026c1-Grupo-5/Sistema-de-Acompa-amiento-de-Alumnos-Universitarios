const LandingNavbar = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="landing-navbar">
      <div className="landing-navbar__content">
        <div className="landing-logo">
          <div className="landing-logo__icon">🎓</div>
          <span>EduPath</span>
        </div>

        <nav className="landing-navbar__actions">
          <button
            className="theme-button"
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {isDarkMode ? "☀" : "☾"}
          </button>

          <a href="/login" className="login-link">
            Iniciar sesión
          </a>

          <a href="/register" className="register-button">
            Registrarse
          </a>
        </nav>
      </div>
    </header>
  );
};

export default LandingNavbar;