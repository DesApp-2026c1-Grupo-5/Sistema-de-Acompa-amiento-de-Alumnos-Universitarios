import { TrendingUp, ChevronRight, TriangleAlert } from 'lucide-react';
import styles from './AcademicAssistantRecommendations.module.css';

const recommendationsData = [
  {
    id: 1,
    type: 'info',
    text: 'Podrías adelantar Base de Datos ya que cumplís con todas las correlatividades'
  },
  {
    id: 2,
    type: 'warning',
    text: 'La regularidad de Matemática II vence pronto. Te conviene rendir el final antes de cursar Redes'
  },
  {
    id: 3,
    type: 'info',
    text: 'Considerá distribuir mejor tu carga horaria: el próximo cuatrimestre está sobrecargado'
  }
];

function AcademicAssistantRecommendations() {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <TrendingUp size={20} className={styles.icon} />
        Recomendaciones inteligentes
      </h3>
      <div className={styles.list}>
        {recommendationsData.map((rec) => (
          <div key={rec.id} className={styles.item}>
            {rec.type === 'warning' ? (
              <TriangleAlert size={20} className={styles.iconWarning} />
            ) : (
              <ChevronRight size={20} className={styles.iconInfo} />
            )}
            <p className={styles.text}>{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AcademicAssistantRecommendations;