import { Lightbulb } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import styles from './AcademicAssistantSimulator.module.css';

function AcademicAssistantSimulator({ subjects, onToggle, onSimulate }) {
  return (
    <Card>
      <div className={styles.simulatorTitle}>
        <Lightbulb size={20} color="#eab308" />
        <h3>Simulador "¿Qué pasa si...?"</h3>
      </div>
      <p className={styles.simulatorDesc}>
        Seleccioná las materias que querés simular como aprobadas para ver qué materias se desbloquean
      </p>
      <div className={styles.checkboxList}>
        {subjects.map((subject) => (
          <label key={subject.id} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={subject.checked}
              onChange={() => onToggle(subject.id)}
            />
            <span>{subject.name}</span>
          </label>
        ))}
      </div>
      <Button variant="primary" onClick={onSimulate}>Simular aprobación</Button>
    </Card>
  );
}

export default AcademicAssistantSimulator;