import styles from './YearsAnalysis.module.css';

function YearsAnalysis({ years }) {
  return (
    <div className={styles.list}>
      {years.map((yearData) => (
        <div key={yearData.year} className={styles.item}>
          <div className={styles.header}>
            <h4 className={styles.title}>Año {yearData.year}</h4>
            <span className={styles.percent}>{yearData.percentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${yearData.percentage}%` }}
            />
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <p>Total</p>
              <p>{yearData.total}</p>
            </div>
            <div className={styles.statItem}>
              <p>Aprobadas</p>
              <p>{yearData.approved}</p>
            </div>
            <div className={styles.statItem}>
              <p>Regularizadas</p>
              <p>{yearData.regularized}</p>
            </div>
            <div className={styles.statItem}>
              <p>Faltantes</p>
              <p>{yearData.missing}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default YearsAnalysis;