import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  FileText,
  Link as LinkIcon,
  Video,
  MessageSquare,
  Globe ,
  X,
} from 'lucide-react';

import styles from '../../pages/admin/ModerationPage/ModerationPage.module.css';

function DetailPanel({
  material,
  onClose,
  onConfirmComplaint,
  onRejectComplaint,
  onToggleSuspend,
}) {
  if (!material) {
    return (
      <div className={styles.detailPanelEmpty}>
        <p>Seleccioná un material para ver el detalle</p>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'archivo':
        return <FileText size={20} />;
      case 'link':
        return <LinkIcon size={20} />;
      case 'youtube':
        return <Video size={20} />;
      case 'discord':
        return <MessageSquare size={20} />;
      case 'github':
        return <Globe size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  return (
    <aside className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <div className={styles.detailTitleContainer}>
          <div className={styles.detailIcon}>
            {getTypeIcon(material.tipo)}
          </div>

          <div>
            <h3 className={styles.detailTitle}>{material.titulo}</h3>

            <p className={styles.detailSubtitle}>
              Subido por {material.subidoPor}
            </p>
          </div>
        </div>

        <button
          className={styles.closeButton}
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className={styles.detailInfo}>
        <div className={styles.infoRow}>
          <span>Tipo:</span>
          <strong>{material.tipo}</strong>
        </div>

        <div className={styles.infoRow}>
          <span>Materia:</span>
          <strong>{material.materia}</strong>
        </div>

        <div className={styles.infoRow}>
          <span>Denuncias:</span>
          <strong>{material.denuncias.length}</strong>
        </div>

        <div className={styles.infoRow}>
          <span>Estado:</span>

          <span
            className={
              material.estado === 'suspendido'
                ? styles.statusSuspended
                : styles.statusActive
            }
          >
            {material.estado}
          </span>
        </div>
      </div>

      <div className={styles.complaintsSection}>
        <div className={styles.complaintsTitle}>
          <AlertTriangle size={18} />
          <h4>Denuncias recibidas</h4>
        </div>

        <div className={styles.complaintsList}>
          {material.denuncias.map((complaint) => (
            <div
              key={complaint.id}
              className={styles.complaintCard}
            >
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
                    className={styles.confirmButton}
                    onClick={() =>
                      onConfirmComplaint(material.id, complaint.id)
                    }
                  >
                    <CheckCircle2 size={16} />
                    Confirmar denuncia
                  </button>

                  <button
                    className={styles.rejectButton}
                    onClick={() =>
                      onRejectComplaint(material.id, complaint.id)
                    }
                  >
                    <XCircle size={16} />
                    Rechazar denuncia
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.detailActions}>
        <button
          className={
            material.estado === 'suspendido'
              ? styles.restoreButton
              : styles.suspendButton
          }
          onClick={() => onToggleSuspend(material.id)}
        >
          <Ban size={18} />

          {material.estado === 'suspendido'
            ? 'Restaurar material'
            : 'Suspender material'}
        </button>
      </div>
    </aside>
  );
}

export default DetailPanel;