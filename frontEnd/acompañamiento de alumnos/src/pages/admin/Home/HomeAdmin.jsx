import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/useAuth';
import { buscarEstudiantesAdmin } from '../../../services/adminHomeService';
import styles from './Home.module.css';

const STUDENTS_PER_PAGE = 5;

function HomeAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const searchContainerRef = useRef(null);
  const requestIdRef = useRef(0);

  const adminName =
    user?.administrador?.nombre ?? 'Administrador';

  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] =
    useState(false);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [searchError, setSearchError] =
    useState('');

  const loadStudents = useCallback(
    async ({
      query,
      requestedPage,
      append = false,
    }) => {
      const requestId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingSearch(true);
      }

      setSearchError('');

      try {
        const res = await buscarEstudiantesAdmin(
          query,
          requestedPage,
          STUDENTS_PER_PAGE
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        const newStudents = res?.data ?? [];
        const pagination = res?.pagination;

        setStudents((previousStudents) => {
          if (!append) {
            return newStudents;
          }

          const existingIds = new Set(
            previousStudents.map(
              (student) => student.estudiante_id
            )
          );

          const uniqueStudents = newStudents.filter(
            (student) =>
              !existingIds.has(student.estudiante_id)
          );

          return [
            ...previousStudents,
            ...uniqueStudents,
          ];
        });

        setPage(requestedPage);
        setHasMore(
          pagination?.hasMore ??
            requestedPage <
              (pagination?.totalPages || 1)
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (!append) {
          setStudents([]);
        }

        setSearchError(
          err.message ||
            'No pudimos cargar los estudiantes.'
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingSearch(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!resultsOpen) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      loadStudents({
        query: searchTerm.trim(),
        requestedPage: 1,
        append: false,
      });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, resultsOpen, loadStudents]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          event.target
        )
      ) {
        setResultsOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  const handleSearchFocus = () => {
    setResultsOpen(true);

    if (
      students.length === 0 &&
      !loadingSearch
    ) {
      loadStudents({
        query: searchTerm.trim(),
        requestedPage: 1,
        append: false,
      });
    }
  };

  const handleResultsScroll = (event) => {
    const element = event.currentTarget;

    const reachedBottom =
      element.scrollHeight -
        element.scrollTop -
        element.clientHeight <
      40;

    if (
      reachedBottom &&
      hasMore &&
      !loadingMore &&
      !loadingSearch
    ) {
      loadStudents({
        query: searchTerm.trim(),
        requestedPage: page + 1,
        append: true,
      });
    }
  };

  const handleGoToStudentProfile = (student) => {
    navigate(
      `/admin/students/${student.estudiante_id}/profile`
    );
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

          <span className={styles.welcomeName}>
            {adminName}
          </span>
        </h1>
      </div>

      <p className={styles.welcomeSubtitle}>
        Panel de Administración de SIVA UNAHUR
      </p>

      <div
        ref={searchContainerRef}
        className={styles.searchContainer}
      >
        <Search
          className={styles.searchIcon}
          size={20}
        />

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar estudiante por nombre, apellido o correo..."
          value={searchTerm}
          onFocus={handleSearchFocus}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setResultsOpen(true);
            setPage(1);
            setHasMore(false);
          }}
        />

        {resultsOpen && (
          <div
            className={styles.searchResults}
            onScroll={handleResultsScroll}
          >
            {loadingSearch && (
              <p className={styles.searchMessage}>
                Cargando estudiantes...
              </p>
            )}

            {!loadingSearch && searchError && (
              <p className={styles.searchError}>
                {searchError}
              </p>
            )}

            {!loadingSearch &&
              !searchError &&
              students.length === 0 && (
                <p
                  className={
                    styles.searchMessage
                  }
                >
                  No se encontraron estudiantes.
                </p>
              )}

            {!loadingSearch &&
              !searchError &&
              students.map((student) => (
                <button
                  type="button"
                  key={student.estudiante_id}
                  className={
                    styles.studentResult
                  }
                  onClick={() =>
                    handleGoToStudentProfile(
                      student
                    )
                  }
                >
                  <span
                    className={
                      styles.studentAvatar
                    }
                  >
                    <UserRound size={20} />
                  </span>

                  <span
                    className={
                      styles.studentInfo
                    }
                  >
                    <strong>
                      {student.nombre_completo}
                    </strong>

                    <small>
                      {student.email}
                    </small>
                  </span>

                  <span
                    className={
                      styles.studentAction
                    }
                  >
                    Ver perfil
                  </span>
                </button>
              ))}

            {loadingMore && (
              <p className={styles.searchMessage}>
                Cargando más estudiantes...
              </p>
            )}

            {!loadingSearch &&
              !loadingMore &&
              students.length > 0 &&
              !hasMore && (
                <p
                  className={
                    styles.resultsEndMessage
                  }
                >
                  No hay más estudiantes.
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeAdmin;