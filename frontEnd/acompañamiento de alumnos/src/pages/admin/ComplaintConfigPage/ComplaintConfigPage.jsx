import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ReasonList from '../../../components/ComplaintConfigPage/ReasonList';

import styles from './ComplaintConfigPage.module.css';

function ComplaintConfigPage() {
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/data/complaintConfig.json');

        if (!response.ok) {
          throw new Error('No se pudo cargar la configuración de denuncias');
        }

        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <p className={styles.loading}>
        Cargando configuración de denuncias...
      </p>
    );
  }

  if (!config) {
    return (
      <p className={styles.loading}>
        No se pudo cargar la configuración.
      </p>
    );
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
        reasons={config.motivos}
        setConfig={setConfig}
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