import { Sparkles, Users, BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import styles from './Home.module.css';
import homeAdminData from './homeAdminData.json';

function HomeAdmin() {
  const { user, stats} = homeAdminData;

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.sparkleWrapper}>
        <div className={styles.sparkleGlow}></div>
        <div className={styles.sparkleIcon}><Sparkles size={40} /></div>
      </div>

      <div>
        <h1 className={styles.welcomeTitle}>
          BIENVENIDO
          <span className={styles.welcomeName}>{user.name}</span>
        </h1>
      </div>

      <p className={styles.welcomeSubtitle}>Panel de Administración de SIVA UNAHUR</p>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users /></div>
          <div className={styles.statValue}>{stats.activeUsers.toLocaleString()}</div>
          <div className={styles.statLabel}>Usuarios activos</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><BookOpen /></div>
          <div className={styles.statValue}>{stats.activeSubjects}</div>
          <div className={styles.statLabel}>Materias activas</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><TrendingUp /></div>
          <div className={styles.statValue}>{stats.activityRate}%</div>
          <div className={styles.statLabel}>Tasa de actividad</div>
        </div>
      </div>
    </div>
  );
}

export default HomeAdmin;