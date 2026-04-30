import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import styles from './StudySessionCard.module.css';

function StudySessionCard({
  subject,
  topic,
  type,
  date,
  duration,
  spots,
  description,
  onJoin,
  onView,
}) {
  return (
    <Card className={styles.sessionCard}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.topic}>{topic}</h3>
          <p className={styles.subject}>{subject}</p>
        </div>

        {type && <Badge variant="tag">{type}</Badge>}
      </div>

      <div className={styles.meta}>
        {date && <span>{date}</span>}
        {duration && <span>{duration}</span>}
        {spots && <span>{spots}</span>}
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.actions}>
        {onView && (
          <Button variant="outline" size="sm" onClick={onView}>
            Ver detalle
          </Button>
        )}

        {onJoin && (
          <Button variant="primary" size="sm" onClick={onJoin}>
            Sumarme
          </Button>
        )}
      </div>
    </Card>
  );
}

export default StudySessionCard;

/*
Ejemplo de uso:

<StudySessionCard
  subject="Base de Datos"
  topic="Resolución TP3"
  type="Virtual"
  date="Viernes 18:00"
  duration="2 hs"
  spots="4 cupos"
  description="Repaso general antes de la entrega."
  onJoin={() => console.log('sumarse')}
/>
*/