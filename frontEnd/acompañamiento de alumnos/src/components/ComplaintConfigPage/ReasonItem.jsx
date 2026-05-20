import { Pencil, Trash2 } from 'lucide-react';
import styles from '../../pages/admin/ComplaintConfigPage/ComplaintConfigPage.module.css';

function ReasonItem({
  reason,
  onEdit,
  onDelete,
}) {
  return (
    <div className={styles.reasonItem}>
      <span className={styles.reasonText}>
        {reason.texto}
      </span>

      <div className={styles.reasonActions}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => onEdit(reason.id)}
        >
          <Pencil size={18} />
        </button>

        <button
          type="button"
          className={styles.actionButton}
          onClick={() => onDelete(reason.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default ReasonItem;