import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ReasonList from '../../../components/ComplaintConfigPage/ReasonList';
import {
  getMotivosAdmin,
  createMotivo,
  updateMotivo,
  deleteMotivo,
} from '../../../services/motivoDenunciaService';

import styles from './ComplaintConfigPage.module.css';

const mapMotivo = (m) => ({
  id: m.id,
  texto: m.descripcion,
  activo: m.activo,
});

function ComplaintConfigPage() {
  const navigate = useNavigate();

  const [motivos, setMotivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMotivosAdmin();
        if (cancelled) return;
        setMotivos((res?.data ?? []).map(mapMotivo));
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.message || 'No pudimos cargar la configuración.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (descripcion) => {
    setActionError('');
    try {
      const res = await createMotivo(descripcion);
      setMotivos((prev) => [...prev, mapMotivo(res.data)]);
    } catch (err) {
      setActionError(err.message || 'No pudimos crear el motivo.');
      throw err;
    }
  };

  const handleEdit = async (id, descripcion) => {
    setActionError('');
    try {
      const res = await updateMotivo(id, descripcion);
      setMotivos((prev) =>
        prev.map((m) => (m.id === id ? mapMotivo(res.data) : m))
      );
    } catch (err) {
      setActionError(err.message || 'No pudimos editar el motivo.');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    setActionError('');
    try {
      await deleteMotivo(id);
      setMotivos((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setActionError(err.message || 'No pudimos eliminar el motivo.');
      throw err;
    }
  };

  if (loading) {
    return (
      <p className={styles.loading}>Cargando configuración de denuncias...</p>
    );
  }

  if (loadError) {
    return <p className={styles.loading}>{loadError}</p>;
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/admin/moderation')}
          aria-label="Volver a denuncias"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1>Configuración de Motivos de Denuncia</h1>
          <p>Gestiona los motivos disponibles para denunciar contenido</p>
        </div>
      </header>

      <ReasonList
        reasons={motivos}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionError={actionError}
      />

      <section className={styles.infoCard}>
        <h2>Información</h2>

        <ul>
          <li>
            Los motivos configurados estarán disponibles para que los usuarios reporten contenido
          </li>
          <li>
            Puedes editar o eliminar motivos existentes en cualquier momento
          </li>
          <li>
            Los cambios se aplicarán inmediatamente en el sistema
          </li>
        </ul>
      </section>
    </section>
  );
}

export default ComplaintConfigPage;
