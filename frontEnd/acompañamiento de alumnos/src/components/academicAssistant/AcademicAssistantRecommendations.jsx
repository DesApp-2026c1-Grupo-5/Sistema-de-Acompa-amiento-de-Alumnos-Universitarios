import { TrendingUp, ChevronRight, TriangleAlert } from 'lucide-react';
import styles from './AcademicAssistantRecommendations.module.css';

function AcademicAssistantRecommendations({ finals = [], subjects = [], years = [], stats = {} }) {
  const recs = [];

  const expiringFinals = finals.filter((f) => f.status === 'expiring');
  for (const f of expiringFinals) {
    recs.push({
      id: `final-${f.id}`,
      type: 'warning',
      text: `La regularidad de ${f.name} vence pronto (${f.expires}). Te conviene rendir el final antes de perderla.`,
    });
  }

  const expiredFinals = finals.filter((f) => f.status === 'expired');
  for (const f of expiredFinals) {
    recs.push({
      id: `final-exp-${f.id}`,
      type: 'warning',
      text: `Perdiste la regularidad de ${f.name}. Vas a tener que recursarla.`,
    });
  }

  const availableThisTerm = subjects.filter((s) => s.availableThisTerm);
  if (availableThisTerm.length > 0) {
    recs.push({
      id: 'available-this-term',
      type: 'info',
      text: `Podés cursar ${availableThisTerm.length} materia${availableThisTerm.length > 1 ? 's' : ''} este cuatrimestre: ${availableThisTerm.map((s) => s.name).join(', ')}`,
    });
  } else if (subjects.length > 0) {
    recs.push({
      id: 'available-no-term',
      type: 'info',
      text: `Tenés ${subjects.length} materia${subjects.length > 1 ? 's' : ''} disponibles para cursar, pero ninguna tiene oferta este cuatrimestre. Consultá en la facultad.`,
    });
  }

  const lowYears = years.filter((y) => y.percentage < 50 && y.missing > 0);
  for (const y of lowYears) {
    recs.push({
      id: `year-${y.year}`,
      type: 'info',
      text: `Tenés ${y.missing} materia${y.missing > 1 ? 's' : ''} pendiente${y.missing > 1 ? 's' : ''} de ${y.year}° año. Priorizarlas te ayuda a liberar correlativas.`,
    });
  }

  const heavyYear = years.find((y) => y.missing > 4);
  if (heavyYear) {
    recs.push({
      id: 'distribute',
      type: 'warning',
      text: `Tenés ${heavyYear.missing} materias pendientes de ${heavyYear.year}° año. Considerá distribuirlas en varios cuatrimestres para no sobrecargarte.`,
    });
  }

  if (stats.creditsMissing > 0 && stats.creditsMissing <= 30) {
    recs.push({
      id: 'credits-close',
      type: 'info',
      text: `Te faltan ${stats.creditsMissing} créditos. Podés cubrirlos con actividades (charlas, cursos) para completar tu carrera más rápido.`,
    });
  }

  if (recs.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <TrendingUp size={20} className={styles.icon} />
        Recomendaciones inteligentes
      </h3>
      {recs.map((rec) => (
        <div key={rec.id} className={styles.item}>
          {rec.type === 'warning' ? (
            <TriangleAlert size={20} className={styles.iconWarning} />
          ) : (
            <ChevronRight size={20} className={styles.iconInfo} />
          )}
          <p>{rec.text}</p>
        </div>
      ))}
    </div>
  );
}

export default AcademicAssistantRecommendations;
