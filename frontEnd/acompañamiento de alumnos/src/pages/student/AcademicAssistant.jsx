import { useEffect, useState } from 'react';

import AcademicAssistantHeader from '../../components/academicAssistant/AcademicAssistantHeader';
import AcademicAssistantStats from '../../components/academicAssistant/AcademicAssistantStats';
import AcademicAssistantSubjects from '../../components/academicAssistant/AcademicAssistantSubjects';
import AcademicAssistantFinals from '../../components/academicAssistant/AcademicAssistantFinals';
import AcademicAssistantYears from '../../components/academicAssistant/AcademicAssistantYears';
import AcademicAssistantSimulator from '../../components/academicAssistant/AcademicAssistantSimulator';
import AcademicAssistantPlanner from '../../components/academicAssistant/AcademicAssistantPlanner';
import AcademicAssistantRecommendations from '../../components/academicAssistant/AcademicAssistantRecommendations';
import { getAcademicAssistant } from '../../services/academicAssistantService';
import styles from './AcademicAssistant.module.css';
function AcademicAssistant() {
  const [academic, setAcademic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAcademicAssistant();
        if (cancelled) return;
        setAcademic(res?.data ?? null);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'No pudimos cargar tu información académica.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className={styles.loading}>Cargando asistente académico...</p>;
  }

  if (error) {
    return <p className={styles.loading}>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <AcademicAssistantHeader progress={academic?.progress} />

      <AcademicAssistantStats stats={academic?.stats ?? {}} />

      <AcademicAssistantSubjects subjects={academic?.subjects ?? []} />

      <AcademicAssistantFinals finals={academic?.finals ?? []} />

      <AcademicAssistantYears years={academic?.years ?? []} />

      <AcademicAssistantSimulator
        approvedIds={academic?.studentStatus?.approvedIds ?? []}
        inProgressIds={academic?.studentStatus?.inProgressIds ?? []}
      />

      <AcademicAssistantPlanner
        approvedIds={academic?.studentStatus?.approvedIds ?? []}
      />

      <AcademicAssistantRecommendations
        finals={academic?.finals ?? []}
        subjects={academic?.subjects ?? []}
        years={academic?.years ?? []}
        stats={academic?.stats ?? {}}
      />
    </div>
  );
}

export default AcademicAssistant;