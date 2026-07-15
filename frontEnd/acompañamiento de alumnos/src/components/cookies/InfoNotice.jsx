import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './InfoNotice.module.css';

function InfoNotice() {
  return (
    <main className={styles.page}>
      <section className={styles.cookieCard}>
        <div className={styles.iconBox}>
          <Cookie size={34} />
        </div>

        <div className={styles.content}>
          <span className={styles.badge}>Uso de cookies</span>

          <h1>Este sitio utiliza cookies</h1>

          <p>
            En SIVA UNAHUR utilizamos cookies para mejorar tu experiencia de
            navegación, optimizar el funcionamiento de la plataforma y ofrecerte
            una experiencia académica más personalizada.
          </p>

          <p>
            Las cookies nos ayudan a recordar ciertas preferencias, mejorar la
            estabilidad del sitio y comprender cómo se utiliza la plataforma para
            seguir perfeccionando sus funcionalidades.
          </p>

          <p className={styles.note}>
            Este aviso es meramente informativo y no requiere ninguna acción por
            parte del usuario.
          </p>

          <div className={styles.actions}>
            <Link to="/" className={styles.acceptButton}>
              Aceptar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default InfoNotice;