import Card from './Card';
import styles from './StatCard.module.css';

function StatCard({ title, value, description, icon }) {
  return (
    <Card className={styles.statCard}>
      <div className={styles.content}>
        <div>
          <p className={styles.title}>{title}</p>
          <strong className={styles.value}>{value}</strong>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
    </Card>
  );
}

export default StatCard;

/*
Ejemplo de uso:

<StatCard
  title="Avance de carrera"
  value="45%"
  description="12 materias aprobadas"
  icon={<GraduationCap size={22} />}
/>
*/