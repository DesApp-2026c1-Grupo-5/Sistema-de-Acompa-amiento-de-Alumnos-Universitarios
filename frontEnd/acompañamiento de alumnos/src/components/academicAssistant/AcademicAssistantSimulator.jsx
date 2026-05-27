import { useState, useEffect, useMemo, useCallback } from 'react';
import { Lightbulb, CheckCircle2, Loader2, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { getCareerSubjects } from '../../services/plannerService';
import styles from './AcademicAssistantSimulator.module.css';

const AREA_CLASS_MAP = {
  CB: styles.areaCB,
  AyL: styles.areaAyL,
  ASOyR: styles.areaASOyR,
  ISBDySI: styles.areaISBDySI,
  TC: styles.areaTC,
  UNAHUR: styles.areaUNAHUR,
  Optativa: styles.areaOptativa,
  APyS: styles.areaAPyS,
  Otros: styles.areaOtros,
};

function AreaBadge({ area }) {
  const cls = AREA_CLASS_MAP[area] || styles.areaOtros;
  return <span className={`${styles.areaBadge} ${cls}`}>{area}</span>;
}

function AcademicAssistantSimulator({ approvedIds = [], inProgressIds = [] }) {
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedIds, setCheckedIds] = useState(() => new Set(inProgressIds));
  const [simulated, setSimulated] = useState(false);

  useEffect(() => {
    getCareerSubjects()
      .then((data) => setAllSubjects(data.subjects))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const approvedSet = useMemo(() => new Set(approvedIds), [approvedIds]);

  const subjectMap = useMemo(() => {
    const map = {};
    for (const s of allSubjects) map[s.id] = s;
    return map;
  }, [allSubjects]);

  const inProgressSubjects = useMemo(
    () => allSubjects.filter((s) => inProgressIds.includes(s.id)),
    [allSubjects, inProgressIds],
  );

  const availableFrom = useCallback(
    (idSet) =>
      allSubjects.filter(
        (s) => !idSet.has(s.id) && s.correlatives.every((c) => idSet.has(c)),
      ),
    [allSubjects],
  );

  const currentAvailable = useMemo(
    () => availableFrom(approvedSet),
    [approvedSet, availableFrom],
  );

  const currentAvailableIds = useMemo(
    () => new Set(currentAvailable.map((s) => s.id)),
    [currentAvailable],
  );

  const unlockedBySubject = useMemo(() => {
    if (!simulated) return {};

    const hypotheticalSet = new Set([...approvedIds, ...checkedIds]);
    const result = {};

    for (const checkedId of checkedIds) {
      const unlocked = allSubjects.filter((s) => {
        if (approvedSet.has(s.id)) return false;
        if (checkedId === s.id) return false;
        if (!s.correlatives.includes(checkedId)) return false;
        if (!s.correlatives.every((c) => hypotheticalSet.has(c))) return false;
        if (currentAvailableIds.has(s.id)) return false;
        return true;
      });

      if (unlocked.length > 0) {
        result[checkedId] = unlocked;
      }
    }

    return result;
  }, [simulated, allSubjects, approvedIds, checkedIds, approvedSet, currentAvailableIds]);

  const totalNewlyUnlocked = useMemo(
    () => {
      const seen = new Set();
      for (const list of Object.values(unlockedBySubject)) {
        for (const s of list) seen.add(s.id);
      }
      return seen.size;
    },
    [unlockedBySubject],
  );

  const checkedSubjectList = useMemo(
    () => [...checkedIds].map((id) => subjectMap[id]).filter(Boolean),
    [checkedIds, subjectMap],
  );

  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSimulated(false);
  };

  const handleSimulate = () => setSimulated(true);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Card title="Simulador ¿Qué pasa si...?">
          <div className={styles.loadingState}>
            <Loader2 size={24} className={styles.spinner} />
            <p>Cargando plan de estudios...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <Card title="Simulador ¿Qué pasa si...?">
          <div className={styles.errorState}>
            <p>Error al cargar el plan de estudios: {error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const hasSelection = checkedIds.size > 0;

  return (
    <div className={styles.wrapper}>
      <Card>
        <div className={styles.header}>
          <Lightbulb size={24} color="#eab308" />
          <div>
            <h3 className={styles.title}>Simulador &quot;¿Qué pasa si...?&quot;</h3>
            <p className={styles.desc}>
              Seleccioná las materias que estás cursando para simular su
              aprobación y descubrí qué nuevas materias podrías cursar el
              próximo cuatrimestre
            </p>
          </div>
        </div>

        <div className={styles.statusBar}>
          <span>
            <GraduationCap size={16} /> {approvedIds.length} aprobadas
          </span>
          <span>
            <BookOpen size={16} /> {inProgressIds.length} en curso
          </span>
        </div>

        {inProgressSubjects.length > 0 ? (
          <div className={styles.checkboxList}>
            {inProgressSubjects.map((subject) => (
              <label
                key={subject.id}
                className={`${styles.checkbox} ${checkedIds.has(subject.id) ? styles.checked : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checkedIds.has(subject.id)}
                  onChange={() => toggleCheck(subject.id)}
                />
                <div className={styles.checkboxInfo}>
                  <span className={styles.checkboxName}>{subject.name}</span>
                  <span className={styles.checkboxMeta}>
                    <AreaBadge area={subject.area} />
                    <span>{subject.year}° año</span>
                  </span>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className={styles.noSubjects}>No tenés materias en curso</p>
        )}

        <Button
          variant="primary"
          onClick={handleSimulate}
          disabled={!hasSelection}
        >
          Simular aprobación
        </Button>

        {simulated && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <CheckCircle2 size={20} color="#16a34a" />
              <h4>Resultado de la simulación</h4>
            </div>

            {totalNewlyUnlocked > 0 ? (
              <p className={styles.resultsSummary}>
                Si regularizás las materias seleccionadas, se desbloquean{' '}
                {totalNewlyUnlocked}{' '}
                {totalNewlyUnlocked === 1
                  ? 'materia nueva'
                  : 'materias nuevas'}
              </p>
            ) : (
              <p className={styles.resultsSummary}>
                Con las materias seleccionadas no se desbloquean materias
                nuevas
              </p>
            )}

            <div className={styles.unlockMap}>
              {checkedSubjectList.map((subject) => {
                const unlocked = unlockedBySubject[subject.id];
                if (!unlocked || unlocked.length === 0) return null;

                return (
                  <div key={subject.id} className={styles.unlockRow}>
                    <div className={styles.unlockCause}>
                      <AreaBadge area={subject.area} />
                      <span className={styles.unlockCauseName}>
                        {subject.name}
                      </span>
                      <ArrowRight size={16} className={styles.unlockArrow} />
                    </div>
                    <div className={styles.unlockEffects}>
                      {unlocked.map((u) => (
                        <span key={u.id} className={styles.unlockChip}>
                          {u.name}
                          <AreaBadge area={u.area} />
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AcademicAssistantSimulator;
