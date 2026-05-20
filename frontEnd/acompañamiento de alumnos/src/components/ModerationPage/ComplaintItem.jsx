import { CheckCircle2, XCircle } from 'lucide-react';

import styles from '../../pages/admin/ModerationPage/ModerationPage.module.css';

function ComplaintItem({
  complaint,
  materialId,
  onConfirmComplaint,
  onRejectComplaint,
}) {
  return (
    <div className={styles.complaintCard}>
      <div className={styles.complaintTop}>
        <strong>{complaint.motivo}</strong>

        <span className={styles.complaintDate}>
          {complaint.fecha}
        </span>
      </div>

      <p className={styles.complaintDescription}>
        {complaint.descripcion}
      </p>

      <div className={styles.complaintFooter}>
        <span>{complaint.denuncianteNombre}</span>

        <span
          className={
            complaint.estado === 'pendiente'
              ? styles.statusPending
              : complaint.estado === 'verificada'
              ? styles.statusVerified
              : styles.statusRejected
          }
        >
          {complaint.estado}
        </span>
      </div>

      {complaint.estado === 'pendiente' && (
        <div className={styles.complaintActions}>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={() => onConfirmComplaint(materialId, complaint.id)}
          >
            <CheckCircle2 size={16} />
            Confirmar denuncia
          </button>

          <button
            type="button"
            className={styles.rejectButton}
            onClick={() => onRejectComplaint(materialId, complaint.id)}
          >
            <XCircle size={16} />
            Rechazar denuncia
          </button>
        </div>
      )}
    </div>
  );
}

export default ComplaintItem;