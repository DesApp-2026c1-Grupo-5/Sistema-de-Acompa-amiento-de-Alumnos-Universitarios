import { useEffect, useState } from 'react';
import { Search, Sparkles, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/useAuth';
import { buscarEstudiantesAdmin } from '../../../services/adminHomeService';
import styles from './Home.module.css';

function HomeAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const adminName = user?.administrador?.nombre ?? 'Administrador';

  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 2) {
      setStudents([]);
      setSearchError('');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoadingSearch(true);
      setSearchError('');

      try {
        const res = await buscarEstudiantesAdmin(query);
        setStudents(res?.data ?? []);
      } catch (err) {
        setStudents([]);
        setSearchError(err.message || 'No pudimos buscar estudiantes.');
      } finally {
        setLoadingSearch(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleGoToStudentProfile = (student) => {
    navigate(`/admin/students/${student.estudiante_id}/profile`);
  };

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm.trim().length >= 2 && (
          <div className={styles.searchResults}>
            {loadingSearch && (
              <p className={styles.searchMessage}>Buscando estudiantes...</p>
            )}

            {!loadingSearch && searchError && (
              <p className={styles.searchError}>{searchError}</p>
            )}

            {!loadingSearch && !searchError && students.length === 0 && (
              <p className={styles.searchMessage}>
                No se encontraron estudiantes.
              </p>
            )}

            {!loadingSearch && !searchError && students.length > 0 && (
              students.map((student) => (
                <button
                  type="button"
                  key={student.estudiante_id}
                  className={styles.studentResult}
                  onClick={() => handleGoToStudentProfile(student)}
                >
                  <span className={styles.studentAvatar}>
                    <UserRound size={20} />
                  </span>

                  <span className={styles.studentInfo}>
                    <strong>{student.nombre_completo}</strong>
                    <small>{student.email}</small>
                  </span>

                  <span className={styles.studentAction}>
                    Ver perfil
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeAdmin;