import Badge from '../common/Badge';
import styles from './FinalsList.module.css';

function FinalsList({ finals }) {
  return (
    <div className={styles.list}>
      {finals.map((final) => (
        <div key={final.id} className={styles.item}>
          <div className={styles.info}>
            <p className={styles.name}>{final.name}</p>
            <div className={styles.meta}>
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
  );
}

export default FinalsList;