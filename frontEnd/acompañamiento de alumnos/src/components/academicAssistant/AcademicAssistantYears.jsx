import Card from '../common/Card';
import styles from './AcademicAssistantYears.module.css';

function AcademicAssistantYears({ years }) {
  return (
    <Card title="Análisis por año de carrera">
      <div className={styles.yearsList}>
        {years.map((yearData) => (
          <div key={yearData.year} className={styles.yearItem}>
            <div className={styles.yearHeader}>
              <h4 className={styles.yearTitle}>Año {yearData.year}</h4>
              <span className={styles.yearPercent}>{yearData.percentage}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${yearData.percentage}%` }}
              />
            </div>
            <div className={styles.yearStats}>
              <div className={styles.yearStatsItem}>
                <p>Total</p>
                <p>{yearData.total}</p>
              </div>
              <div className={styles.yearStatsItem}>
                <p>Aprobadas</p>
                <p>{yearData.approved}</p>
              </div>
              <div className={styles.yearStatsItem}>
                <p>Regularizadas</p>
                <p>{yearData.regularized}</p>
              </div>
              <div className={styles.yearStatsItem}>
                <p>Faltantes</p>
                <p>{yearData.missing}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default AcademicAssistantYears;