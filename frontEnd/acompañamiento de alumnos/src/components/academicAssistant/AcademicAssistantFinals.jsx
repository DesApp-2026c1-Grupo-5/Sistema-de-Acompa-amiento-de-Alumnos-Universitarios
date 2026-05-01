import Card from '../common/Card';
import Badge from '../common/Badge';
import styles from './AcademicAssistantFinals.module.css';

function AcademicAssistantFinals({ finals }) {
  return (
    <Card title="Finales pendientes">
      <div className={styles.finalsList}>
        {finals.map((final) => (
          <div key={final.id} className={styles.finalItem}>
            <div className={styles.finalInfo}>
              <p className={styles.finalName}>{final.name}</p>
              <div className={styles.finalMeta}>
                <span>Intentos: {final.attempts}</span>
                <span>Vence: {final.expires}</span>
              </div>
            </div>
            <Badge variant={final.status === 'expiring' ? 'warning' : 'success'}>
              {final.status === 'expiring' ? 'Por vencer' : 'Vigente'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default AcademicAssistantFinals;