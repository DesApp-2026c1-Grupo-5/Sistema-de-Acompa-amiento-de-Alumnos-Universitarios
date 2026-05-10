/**
 * Lista las materias disponibles para inscripción.
 */

import Card from '../common/Card';
import styles from './EnrollmentSubjects.module.css';

export default function EnrollmentSubjects({ materias }) {
  return (
    <Card>
      <div className={styles.container}>
        <h2>Materias habilitadas para inscripción</h2>

        <div className={styles.list}>
          {materias.map((materia) => (
            <div className={styles.item} key={materia.id}>
              <div>
                <h3>{materia.nombre}</h3>
                <p>
                  Año {materia.anio} · {materia.cuatrimestre}° cuatrimestre
                </p>
              </div>

              <button className={styles.button}>Inscribirse</button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}