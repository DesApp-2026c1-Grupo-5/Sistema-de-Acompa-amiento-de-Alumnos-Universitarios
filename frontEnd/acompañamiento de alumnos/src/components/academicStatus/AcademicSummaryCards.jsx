/**
 * Muestra las cards principales de resumen académico.
 */

import StatCard from '../common/StatCard';
import styles from './AcademicSummaryCards.module.css';

export default function AcademicSummaryCards({ resumen }) {
  const cards = [
    {
      title: 'Avance de carrera',
      value: `${resumen.avance}%`
    },
    {
      title: 'Materias aprobadas',
      value: resumen.materiasAprobadas
    },
    {
      title: 'Materias regularizadas',
      value: resumen.materiasRegularizadas
    },
    {
      title: 'Materias pendientes',
      value: resumen.materiasPendientes
    }
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
        />
      ))}
    </div>
  );
}