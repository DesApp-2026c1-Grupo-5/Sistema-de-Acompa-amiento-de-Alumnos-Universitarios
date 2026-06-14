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
import academicData from './academicAssistant/academicAssistantData.json';

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

      <AcademicAssistantFinals finals={academicData.finals} />

      <AcademicAssistantYears years={academicData.years} />

      <AcademicAssistantSimulator
        approvedIds={academicData.studentStatus.approvedIds}
        inProgressIds={academicData.studentStatus.inProgressIds}
      />

      <AcademicAssistantPlanner
        approvedIds={academicData.studentStatus?.approvedIds ?? []}
      />

      <AcademicAssistantRecommendations />
    </div>
  );
}

export default AcademicAssistant;