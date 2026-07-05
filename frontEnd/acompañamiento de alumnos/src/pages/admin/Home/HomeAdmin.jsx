import { Sparkles, Search } from 'lucide-react';

import { useAuth } from '../../../context/useAuth';
import styles from './Home.module.css';

function HomeAdmin() {
  const { user } = useAuth();
  const adminName = user?.administrador?.nombre ?? 'Administrador';

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.sparkleWrapper}>
        <div className={styles.sparkleGlow}></div>
        <div className={styles.sparkleIcon}>
          <Sparkles size={40} />
        </div>
      </div>

      <div>
        <h1 className={styles.welcomeTitle}>
          BIENVENIDO
          <span className={styles.welcomeName}>{adminName}</span>
        </h1>
      </div>

      <p className={styles.welcomeSubtitle}>
        Panel de Administración de SIVA UNAHUR
      </p>

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar estudiante por nombre, apellido o correo..."
        />
      </div>
    </div>
  );
}

export default HomeAdmin;
