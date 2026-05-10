import { Eye, SquarePen, MoreVertical } from 'lucide-react';
import styles from './CareerCard.module.css';

function CareerCard({ career, onViewPlan, onEdit }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{career.name}</h3>
          <p className={styles.cardFaculty}>{career.faculty}</p>
        </div>
        <button className={styles.menuButton}>
          <MoreVertical size={16} />
        </button>
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Título:</span>
          <span className={styles.metaValue}>{career.title}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Duración:</span>
          <span className={styles.metaValue}>{career.duration}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Planes:</span>
          <span className={styles.metaValue}>{career.plans.length}</span>
        </div>
      </div>

      <div className={styles.plansSection}>
        <p className={styles.plansLabel}>Planes de estudio</p>
        <div className={styles.plansList}>
          {career.plans.map((plan, index) => (
            <div key={index} className={styles.planItem}>
              <span className={styles.planName}>Plan {plan.year}</span>
              <span className={`${styles.planStatus} ${styles[plan.status.toLowerCase()]}`}>
                {plan.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.viewButton} onClick={() => onViewPlan?.(career)}>
          <Eye size={16} />
          Ver plan activo
        </button>
        <button className={styles.editButton} onClick={() => onEdit?.(career)}>
          <SquarePen size={16} />
          Editar
        </button>
      </div>
    </div>
  );
}

export default CareerCard;
