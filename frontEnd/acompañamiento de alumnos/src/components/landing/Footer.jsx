import { Link } from "react-router-dom";
import styles from "../../styles/landing.module.css";

const Footer = () => {
  return (
    <footer className={styles.landingFooter}>
      <div className={styles.landingFooter__content}>
        <div className={styles.landingFooter__brand}>
          <div className={styles.landingLogo}>
            <div className={styles.landingLogo__icon}>🎓</div>
            <span>SIVA UNAHUR</span>
          </div>

          <p>
            La plataforma integral para estudiantes universitarios que buscan
            optimizar su trayectoria académica y conectar con su comunidad.
          </p>
          
        </div>

        <div className={styles.landingFooter__bottom}>
          <p>© 2026 SIVA UNAHUR. Todos los derechos reservados.</p>

          <div>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/terminos">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;