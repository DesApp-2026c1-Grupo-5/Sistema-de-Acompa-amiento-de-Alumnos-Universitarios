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
    <Card>
      <h3 className={styles.title}>Planificador de cursada</h3>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Horas disponibles por semana</label>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className={styles.input}
        />
      </div>
      <Button variant="primary" onClick={handleGenerate} iconLeft={<Calendar size={20} />}>
        Generar plan
      </Button>
    </Card>
  );
}

export default AcademicAssistantPlanner;