import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/materials/Header';
import Sidebar from '../../components/materials/Sidebar';
import SearchBar from '../../components/materials/SearchBar';
import MaterialGrid from '../../components/materials/MaterialGrid';
import UploadMaterialModal from '../../components/materials/UploadMaterialModal';
import MaterialDetailModal from '../../components/materials/MaterialDetailModal';
import ReportModal from '../../components/materials/ReportModal';
import Button from '../../components/common/Button'
import { initialMaterials } from './materials/mockData';
import { filterMaterials } from './materials/helpers';
import styles from './MaterialRepositoryPage.module.css';

const ROUTE_BY_ID = {
  home: '/student/home',
  profile: '/student/profile',
  academic: '/student/academic-status',
  planner: '/student/academic-assistant',
  sessions: '/student/study-sessions',
  materials: '/student/materials',
};

function MaterialRepositoryPage() {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState(initialMaterials);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailMaterial, setDetailMaterial] = useState(null);
  const [reportMaterial, setReportMaterial] = useState(null);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);


  useEffect(() => {
    const root = document.getElementById('root');
    root?.classList.add('fullwidth');
    return () => root?.classList.remove('fullwidth');
  }, []);

  const filtered = useMemo(
    () => filterMaterials(materials, { query, type: typeFilter }),
    [materials, query, typeFilter]
  );

  const updateMaterial = (id, updater) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updater(m) } : m))
    );
    setDetailMaterial((prev) =>
      prev && prev.id === id ? { ...prev, ...updater(prev) } : prev
    );
  };

  const handleUploadSubmit = (newMaterial) => {
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const handleView = (material) => setDetailMaterial(material);

  const handleDownload = (material) => {
    updateMaterial(material.id, (m) => ({ downloads: (m.downloads || 0) + 1 }));
    if (material.fileUrl) {
      const a = document.createElement('a');
      a.href = material.fileUrl;
      a.download = material.fileName || material.title;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const handleJoinDiscord = (material) => {
    if (material.externalUrl) {
      window.open(material.externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleVote = (material, kind) => {
    const current = userVotes[material.id] || null;
    setUserVotes((prev) => {
      const next = { ...prev };
      if (current === kind) {
        delete next[material.id];
      } else {
        next[material.id] = kind;
      }
      return next;
    });

    updateMaterial(material.id, (m) => {
      const likes = m.likes || 0;
      const dislikes = m.dislikes || 0;
      if (current === kind) {
        return kind === 'like'
          ? { likes: Math.max(0, likes - 1) }
          : { dislikes: Math.max(0, dislikes - 1) };
      }
      if (kind === 'like') {
        return current === 'dislike'
          ? { likes: likes + 1, dislikes: Math.max(0, dislikes - 1) }
          : { likes: likes + 1 };
      }
      return current === 'like'
        ? { dislikes: dislikes + 1, likes: Math.max(0, likes - 1) }
        : { dislikes: dislikes + 1 };
    });
  };

  const handleReportSubmit = (payload) => {
    console.info('[Denuncia enviada]', payload);
  };

  const handleSidebarSelect = (item) => {
    const route = ROUTE_BY_ID[item.id];
    if (route && route !== '/student/materials') {
      navigate(route);
    }
  };

  return (
    <div className={styles.page}>
      <Header
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        isDark={isDark}
        onToggleTheme={() => setIsDark((v) => !v)}
        userInitials="FG"
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="materials"
        onSelect={handleSidebarSelect}
      />

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
            onTypeFilterChange={setTypeFilter}
          />
        </section>

        <section className={styles.gridSection}>
          <MaterialGrid
            materials={filtered}
            onView={handleView}
            onDownload={handleDownload}
            onJoinDiscord={handleJoinDiscord}
          />
        </section>
      </main>

      {uploadOpen && (
        <UploadMaterialModal
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
          onReport={(m) => setReportMaterial(m)}
          userVote={userVotes[detailMaterial.id]}
        />
      )}

      {reportMaterial && (
        <ReportModal
          material={reportMaterial}
          onClose={() => setReportMaterial(null)}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  );
}

export default MaterialRepositoryPage;
