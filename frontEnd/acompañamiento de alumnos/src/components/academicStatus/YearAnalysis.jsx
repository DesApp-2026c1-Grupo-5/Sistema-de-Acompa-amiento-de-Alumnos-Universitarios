/**
 * Analiza el progreso académico por año.
 */

import Card from '../common/Card';
import Badge from '../common/Badge';
import styles from './YearAnalysis.module.css';

export default function YearAnalysis({ anios }) {
  return (
    <Card>
      <div className={styles.container}>
        <h2>Análisis por año</h2>

        <div className={styles.grid}>
          {anios.map((anio) => (
            <div className={styles.card} key={anio.anio}>
              <div className={styles.header}>
                <h3>{anio.anio}° Año</h3>

                <Badge>
                  {anio.completo ? 'Completo' : 'Incompleto'}
                </Badge>
              </div>

              <p>Aprobadas: {anio.aprobadas}</p>
              <p>Regularizadas: {anio.regularizadas}</p>
              <p>Faltantes: {anio.faltantes}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}