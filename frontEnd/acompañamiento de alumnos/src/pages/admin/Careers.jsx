import { useState, useEffect, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import PageTitle from '../../components/common/PageTitle';
import Modal from '../../components/common/Modal';
import CareerCard from '../../components/admin/CareerCard';
import CareerForm from './CareerForm';
import { getCarreras } from '../../services/carreraService';
import { mapCarreraFromApi } from './careers/mapCarrera';
import styles from './Careers.module.css';

function Careers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const loadCareers = useCallback(async () => {
    try {
      const res = await getCarreras();
      setCareers((res?.data ?? []).map(mapCarreraFromApi));
      setError(null);
    } catch (err) {
      setError(err.message || 'No pudimos cargar las carreras.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCarreras();
        if (cancelled) return;
        setCareers((res?.data ?? []).map(mapCarreraFromApi));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'No pudimos cargar las carreras.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCareers = careers.filter((career) =>
    career.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreated = async () => {
    setFormOpen(false);
    setLoading(true);
    await loadCareers();
  };

  return (
    <div className={styles.container}>
      <PageTitle
        title="Gestión de Carreras"
        description="Administra carreras, planes de estudio y correlatividades"
      />

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Buscar carrera..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p className={styles.statusText}>Cargando carreras…</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          <button
            type="button"
            className={styles.addCard}
            onClick={() => setFormOpen(true)}
          >
            <div className={styles.addIconWrapper}>
              <Plus size={32} />
            </div>
            <h3 className={styles.addTitle}>Agregar carrera</h3>
            <p className={styles.addDescription}>
              Definir nueva carrera universitaria
            </p>
          </button>

          {filteredCareers.map((career) => (
            <CareerCard key={career.id} career={career} />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        title="Agregar carrera"
        onClose={() => setFormOpen(false)}
        size="lg"
      >
        <CareerForm onCancel={() => setFormOpen(false)} onCreated={handleCreated} />
      </Modal>
    </div>
  );
}

export default Careers;
