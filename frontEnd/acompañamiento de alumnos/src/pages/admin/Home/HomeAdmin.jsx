import { useEffect, useState } from 'react';
import { Sparkles, Users, BookOpen, TrendingUp } from 'lucide-react';

import { useAuth } from '../../../context/useAuth';
import { getAdminHomeStats } from '../../../services/adminHomeService';
import styles from './Home.module.css';

function HomeAdmin() {
  const { user } = useAuth();
  const adminName = user?.administrador?.nombre ?? 'Administrador';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminHomeStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message || 'No pudimos cargar las estadísticas.'))
      .finally(() => setLoading(false));
  }, []);

  const renderValue = (value) => {
    if (loading) return '…';
    if (error || value == null) return '—';
    return value.toLocaleString();
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.sparkleWrapper}>
        <div className={styles.sparkleGlow}></div>
        <div className={styles.sparkleIcon}><Sparkles size={40} /></div>
      </div>

      <div>
        <h1 className={styles.welcomeTitle}>
          BIENVENIDO
          <span className={styles.welcomeName}>{adminName}</span>
        </h1>
      </div>

      <p className={styles.welcomeSubtitle}>Panel de Administración de SIVA UNAHUR</p>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users /></div>
          <div className={styles.statValue}>{renderValue(stats?.active_users)}</div>
          <div className={styles.statLabel}>Usuarios activos</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><BookOpen /></div>
          <div className={styles.statValue}>{renderValue(stats?.active_subjects)}</div>
          <div className={styles.statLabel}>Materias activas</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><TrendingUp /></div>
          <div className={styles.statValue}>
            {loading ? '…' : error || stats?.activity_rate == null ? '—' : `${stats.activity_rate}%`}
          </div>
          <div className={styles.statLabel}>Tasa de actividad</div>
        </div>
      </div>
    </div>
  );
}

export default HomeAdmin;
