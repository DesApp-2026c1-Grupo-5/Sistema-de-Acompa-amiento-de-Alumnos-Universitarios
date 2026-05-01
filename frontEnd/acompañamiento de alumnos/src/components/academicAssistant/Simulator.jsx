import { Lightbulb } from 'lucide-react';
import Button from '../common/Button';
import styles from './Simulator.module.css';

function Simulator({ subjects, onToggle, onSimulate }) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Lightbulb size={20} color="#eab308" />
        <h3>Simulador "¿Qué pasa si...?"</h3>
      </div>
      <p className={styles.desc}>
        Seleccioná las materias que querés simular como aprobadas para ver qué materias se desbloquean
      </p>
      <div className={styles.checkboxList}>
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
      </div>
      <Button variant="primary" onClick={onSimulate}>
        Simular aprobación
      </Button>
    </div>
  );
}

export default Simulator;