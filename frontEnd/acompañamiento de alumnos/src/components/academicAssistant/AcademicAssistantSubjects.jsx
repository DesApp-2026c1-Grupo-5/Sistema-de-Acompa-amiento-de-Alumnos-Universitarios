import { CircleCheckBig } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import styles from './AcademicAssistantSubjects.module.css';

function AcademicAssistantSubjects({ subjects }) {
  return (
    <Card title="Materias disponibles para cursar">
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
          {subjects.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.emptyRow}>
                No tenés materias disponibles para cursar en este momento.
              </td>
            </tr>
          ) : (
            subjects.map((subject) => (
              <tr key={subject.id}>
                <td>{subject.name}</td>
                <td>{subject.year}</td>
                <td>{subject.type}</td>
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
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}

export default AcademicAssistantSubjects;