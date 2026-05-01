import { CircleCheckBig } from 'lucide-react';
import Badge from '../common/Badge';
import styles from './SubjectsTable.module.css';

function SubjectsTable({ subjects }) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Materia</th>
            <th>Año</th>
            <th>Tipo</th>
            <th>Correlatividades</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td>
                <div className={styles.subjectName}>
                  <span>{subject.name}</span>
                  {subject.availableThisTerm && (
                    <Badge variant="info">Disponible este cuatrimestre</Badge>
                  )}
                </div>
              </td>
              <td>{subject.year}</td>
              <td style={{ textTransform: 'capitalize' }}>{subject.type}</td>
              <td>
                <span className={styles.correlatives}>
                  <CircleCheckBig size={16} />
                  {subject.correlatives.text}
                </span>
              </td>
              <td>
                <Badge variant="success">Disponible</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubjectsTable;