import { useState } from 'react';
import { Calendar } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import styles from './AcademicAssistantPlanner.module.css';

function AcademicAssistantPlanner() {
  const [hours, setHours] = useState(20);

  const handleGenerate = () => {
    console.log('Generando plan para', hours, 'horas');
  };

  return (
    <div className={styles.planner}>
      <Card>
        <h3 className={styles.title}>Planificador de cursada</h3>
      <label className={styles.label}>
        Horas disponibles por semana
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className={styles.input}
        />
      </label>
      <Button variant="primary" onClick={handleGenerate} iconLeft={<Calendar size={20} />}>
        Generar plan
      </Button>
      </Card>
    </div>
  );
}

export default AcademicAssistantPlanner;