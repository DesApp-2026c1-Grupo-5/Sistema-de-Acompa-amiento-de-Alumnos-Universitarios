import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import SearchBar from '../../components/materials/SearchBar';
import MaterialGrid from '../../components/materials/MaterialGrid';
import UploadMaterialModal from '../../components/materials/UploadMaterialModal';
import MaterialDetailModal from '../../components/materials/MaterialDetailModal';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import { mapMaterialFromApi } from './materials/mapMaterial';
import {
  getMaterials,
  getMaterial,
  createMaterial,
  voteMaterial,
  getMaterias,
} from '../../services/materialService';
import styles from './MaterialRepositoryPage.module.css';

function MaterialRepositoryPage() {
  const [materials, setMaterials] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailMaterial, setDetailMaterial] = useState(null);

  useEffect(() => {
    getMaterias()
      .then((res) => setMaterias(res?.data ?? []))
      .catch(() => setMaterias([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let active = true;
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const res = await getMaterials({ page, limit: 12, q: debouncedQuery, tipo: typeFilter });
        if (!active) return;
        setMaterials((res?.data ?? []).map(mapMaterialFromApi));
        setTotalPages(res?.pagination?.totalPages ?? 1);
      } catch (err) {
        if (active) setError(err.message || 'No pudimos cargar los materiales.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchMaterials();
    return () => {
      active = false;
    };
  }, [page, debouncedQuery, typeFilter]);

  const updateMaterial = (id, updater) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updater(m) } : m))
    );
    setDetailMaterial((prev) =>
      prev && prev.id === id ? { ...prev, ...updater(prev) } : prev
    );
  };

  const handleUploadSubmit = async (payload) => {
    const res = await createMaterial(payload);
    setMaterials((prev) => [mapMaterialFromApi(res.data), ...prev]);
  };

  const handleView = async (material) => {
    try {
      const res = await getMaterial(material.id);
      setDetailMaterial(mapMaterialFromApi(res.data));
    } catch {
      setDetailMaterial(material);
    }
  };

  const handleDownload = (material) => {
    if (material.fileUrl) {
      window.open(material.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleJoinDiscord = (material) => {
    if (material.externalUrl) {
      window.open(material.externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleVote = async (material, kind) => {
    try {
      const res = await voteMaterial(material.id, kind);
      updateMaterial(material.id, () => ({
        likes: res.data.likes,
        dislikes: res.data.dislikes,
        miVoto: res.data.mi_voto,
      }));
    } catch {
      // si el voto falla, el contador queda sin cambios
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.topbar}>
          <h1 className={styles.title}>Repositorio de Materiales</h1>
          <Button
            variant="primary"
            iconLeft={<Plus size={16} strokeWidth={2.5} />}
            onClick={() => setUploadOpen(true)}
          >
            Subir material
          </Button>
        </section>

        <section className={styles.searchSection}>
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
          />
        </section>

        <section className={styles.gridSection}>
          {loading ? (
            <p className={styles.statusText}>Cargando materiales…</p>
          ) : error ? (
            <ErrorState
              title="No pudimos cargar los materiales"
              description={error}
            />
          ) : (
            <>
              <MaterialGrid
                materials={materials}
                onView={handleView}
                onDownload={handleDownload}
                onJoinDiscord={handleJoinDiscord}
              />
              {totalPages > 1 && (
                <div className={styles.paginationSection}>
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {uploadOpen && (
        <UploadMaterialModal
          materias={materias}
          onClose={() => setUploadOpen(false)}
          onSubmit={handleUploadSubmit}
        />
      )}

      {detailMaterial && (
        <MaterialDetailModal
          open
          material={detailMaterial}
          onClose={() => setDetailMaterial(null)}
          onLike={(m) => handleVote(m, 'like')}
          onDislike={(m) => handleVote(m, 'dislike')}
          userVote={detailMaterial.miVoto}
        />
      )}
    </div>
  );
}

export default MaterialRepositoryPage;
