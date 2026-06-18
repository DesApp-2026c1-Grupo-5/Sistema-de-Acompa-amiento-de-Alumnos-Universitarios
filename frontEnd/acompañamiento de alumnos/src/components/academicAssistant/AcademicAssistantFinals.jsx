import Card from '../common/Card';
import Badge from '../common/Badge';
import styles from './AcademicAssistantFinals.module.css';

function AcademicAssistantFinals({ finals }) {
  const badgeVariant = (status) => {
    if (status === 'expired') return 'danger';
    if (status === 'expiring') return 'warning';
    return 'success';
  };

  const badgeText = (status) => {
    if (status === 'expired') return 'Vencido';
    if (status === 'expiring') return 'Por vencer';
    return 'Vigente';
  };

  return (
    <Card title="Finales pendientes">
      {finals.map((final) => (
        <div key={final.id} className={styles.item}>
          <div>
            <p className={styles.name}>{final.name}</p>
            <span className={styles.meta}>Intentos: {final.attempts} • Vence: {final.expires}</span>
          </div>
          <Badge variant={badgeVariant(final.status)}>
            {badgeText(final.status)}
          </Badge>
        </div>
      ))}
    </Card>
  );
}

export default AcademicAssistantFinals;