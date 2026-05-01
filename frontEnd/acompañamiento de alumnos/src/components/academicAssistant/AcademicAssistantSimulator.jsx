import { Lightbulb } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import styles from './AcademicAssistantSimulator.module.css';

function AcademicAssistantSimulator({ subjects, onToggle, onSimulate }) {
  return (
    <Card>
      <h3 className={styles.title}>
        <Lightbulb size={20} color="#eab308" />
        Simulador "¿Qué pasa si...?"
      </h3>
      <p className={styles.desc}>
        Seleccioná las materias que querés simular como aprobadas para ver qué materias se desbloquean
      </p>
      {subjects.map((subject) => (
        <label key={subject.id} className={styles.checkbox}>
          <input
            type="checkbox"
            checked={subject.checked}
            onChange={() => onToggle(subject.id)}
          />
          <span>{subject.name}</span>
        </label>
      ))}
      <Button variant="primary" onClick={onSimulate}>Simular aprobación</Button>
    </Card>
  );
}

export default AcademicAssistantSimulator;