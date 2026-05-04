import Card from '../common/Card';
import Badge from '../common/Badge';
import styles from './AcademicAssistantFinals.module.css';

function AcademicAssistantFinals({ finals }) {
  return (
    <Card title="Finales pendientes">
      {finals.map((final) => (
        <div key={final.id} className={styles.item}>
          <div>
            <p className={styles.name}>{final.name}</p>
            <span className={styles.meta}>Intentos: {final.attempts} • Vence: {final.expires}</span>
          </div>
          <Badge variant={final.status === 'expiring' ? 'warning' : 'success'}>
            {final.status === 'expiring' ? 'Por vencer' : 'Vigente'}
          </Badge>
        </div>
      ))}
    </Card>
  );
}

export default AcademicAssistantFinals;