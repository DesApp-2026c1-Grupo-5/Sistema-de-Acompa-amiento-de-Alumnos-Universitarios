import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import styles from './AcademicAssistantYears.module.css';

const statsLabels = ['Total', 'Aprobadas', 'Regularizadas', 'Faltantes'];
const statsKeys = ['total', 'approved', 'regularized', 'missing'];

function AcademicAssistantYears({ years }) {
  return (
    <Card title="Análisis por año de carrera">
      {years.map((year) => (
        <div key={year.year} className={styles.item}>
          <div className={styles.header}>
            <h4>Año {year.year}</h4>
            <span>{year.percentage}%</span>
          </div>
          <ProgressBar percentage={year.percentage} />
          <div className={styles.stats}>
            {statsLabels.map((label, i) => (
              <div key={label} className={styles.stat}>
                <p>{label}</p>
                <p>{year[statsKeys[i]]}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}

export default AcademicAssistantYears;