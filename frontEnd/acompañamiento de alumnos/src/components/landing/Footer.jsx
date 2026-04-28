const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__content">
        <div className="landing-footer__brand">
          <div className="landing-logo">
            <div className="landing-logo__icon">🎓</div>
            <span>SIVA UNAHUR</span>
          </div>

          <p>
            La plataforma integral para estudiantes universitarios que buscan
            optimizar su trayectoria académica y conectar con su comunidad.
          </p>

          <div className="landing-footer__social">
            <span>𝕏</span>
            <span>Instagram</span>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p>© 2026 SIVA UNAHUR. Todos los derechos reservados.</p>

          <div>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;