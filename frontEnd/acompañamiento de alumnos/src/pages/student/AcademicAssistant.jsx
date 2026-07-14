import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AcademicAssistantHeader from '../../components/academicAssistant/AcademicAssistantHeader';
import AcademicAssistantStats from '../../components/academicAssistant/AcademicAssistantStats';
import AcademicAssistantSubjects from '../../components/academicAssistant/AcademicAssistantSubjects';
import AcademicAssistantFinals from '../../components/academicAssistant/AcademicAssistantFinals';
import AcademicAssistantYears from '../../components/academicAssistant/AcademicAssistantYears';
import AcademicAssistantSimulator from '../../components/academicAssistant/AcademicAssistantSimulator';
import AcademicAssistantPlanner from '../../components/academicAssistant/AcademicAssistantPlanner';
import AcademicAssistantRecommendations from '../../components/academicAssistant/AcademicAssistantRecommendations';
import Button from '../../components/common/Button';
import PageTitle from '../../components/common/PageTitle';
import { getAcademicAssistant } from '../../services/academicAssistantService';
import styles from './AcademicAssistant.module.css';

const UNAVAILABLE_MESSAGES = {
  NO_STUDENT_PROFILE: 'No encontramos tu perfil de estudiante.',
  PLAN_NOT_FOUND: 'No encontramos el plan de estudios asociado a tu carrera.',
};

function AcademicAssistant() {
  const navigate = useNavigate();
  const [academic, setAcademic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAcademicAssistant();
        if (cancelled) return;
        const data = res?.data ?? null;
        const unavailableReason = data?.availability?.canUse === false
          ? data.availability.reason
          : null;

        if (unavailableReason && unavailableReason !== 'NO_ACADEMIC_SITUATION') {
          throw new Error(
            UNAVAILABLE_MESSAGES[unavailableReason] ||
              'No pudimos habilitar el asistente académico.'
          );
        }

        setAcademic(data);
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

  if (academic?.availability?.reason === 'NO_ACADEMIC_SITUATION') {
    return (
      <div className={styles.container}>
        <PageTitle
          title="Asistente Académico"
          description="Planificá tu cursada y analizá tu progreso"
        />

        <section className={styles.setupCard}>
          <div className={styles.setupIcon}>
            <BookOpen size={32} aria-hidden="true" />
          </div>
          <h2 className={styles.setupTitle}>Asociá una carrera para continuar</h2>
          <p className={styles.setupText}>
            Para poder usar el Asistente Académico, primero tenés que estar anotado en una carrera.
          </p>
          <Button
            className={styles.setupAction}
            onClick={() => navigate('/student/academic-status')}
          >
            Seleccionar carrera y plan
          </Button>
        </section>
      </div>
    );
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
