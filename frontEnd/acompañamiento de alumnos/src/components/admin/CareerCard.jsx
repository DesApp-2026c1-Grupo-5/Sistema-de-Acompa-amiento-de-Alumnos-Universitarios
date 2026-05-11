import { useNavigate } from 'react-router-dom';
import { Eye, SquarePen, MoreVertical } from 'lucide-react';
import Button from '../common/Button';
import styles from './CareerCard.module.css';

function CareerCard({ career }) {
  const navigate = useNavigate();

  const handleViewPlan = () => {
    const activePlan = career.plans.find(p => p.status === 'Vigente') || career.plans[0];
    navigate('/admin/study-plan', { 
      state: { 
        careerId: career.id, 
        planYear: activePlan.year 
      } 
    });
  };

  const handleEdit = () => {
    const activePlan = career.plans.find(p => p.status === 'Vigente') || career.plans[0];
    navigate('/admin/study-plan', { 
      state: { 
        careerId: career.id, 
        planYear: activePlan.year 
      } 
    });
  };

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
        <Button
          variant="gradient"
          size="sm"
          fullWidth
          iconLeft={<Eye size={16} />}
          onClick={handleViewPlan}
        >
          Ver plan activo
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconLeft={<SquarePen size={16} />}
          onClick={handleEdit}
        >
          Editar
        </Button>
      </div>
    </div>
  );
}

export default CareerCard;
