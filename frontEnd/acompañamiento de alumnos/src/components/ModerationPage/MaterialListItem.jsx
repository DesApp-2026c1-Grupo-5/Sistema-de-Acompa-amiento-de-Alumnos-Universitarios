import {
  FileText,
  Link as LinkIcon,
  Video,
  MessageSquare,
  Globe,
} from 'lucide-react';

import styles from '../../pages/admin/ModerationPage/ModerationPage.module.css';

function MaterialListItem({
  material,
  selectedMaterial,
  onSelect,
}) {
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'link':
        return <LinkIcon size={20} />;
      case 'video':
      case 'youtube':
        return <Video size={20} />;
      case 'discord':
        return <MessageSquare size={20} />;
      case 'github':
        return <Globe size={20} />;
      case 'archivo':
      case 'pdf':
      default:
        return <FileText size={20} />;
    }
  };

  const getRiskLevel = (complaintsCount) => {
    if (complaintsCount >= 8) return 'Alta';
    if (complaintsCount >= 4) return 'Media';
    return 'Baja';
  };

  const getRiskClass = (complaintsCount) => {
    if (complaintsCount >= 8) return styles.high;
    if (complaintsCount >= 4) return styles.medium;
    return styles.low;
  };

  const getStatusClass = (status) => {
    if (status === 'suspendido') return styles.suspendedStatus;
    if (status === 'verificada') return styles.verifiedStatus;
    if (status === 'rechazada') return styles.rejectedStatus;

    return styles.pendingStatus;
  };

  const complaintsCount =
    material.denunciasPendientes ??
    material.denuncias?.filter((denuncia) => denuncia.estado === 'pendiente').length ??
    0;

  const isSelected = selectedMaterial?.id === material.id;

  return (
    <button
      type="button"
      className={`${styles.materialRow} ${isSelected ? styles.selectedRow : ''}`}
      onClick={() => onSelect(material)}
    >
      <div className={styles.materialInfo}>
        <div className={styles.materialIcon}>
          {getTypeIcon(material.tipo)}
        </div>

        <div className={styles.materialTexts}>
          <span className={styles.materialTitle}>
            {material.titulo}
          </span>

          <span className={styles.materialType}>
            {material.tipo}
          </span>
        </div>
      </div>

      <span className={styles.userName}>
        {material.subidoPor}
      </span>

      <div className={styles.reportCount}>
        <span>{complaintsCount}</span>

        <span className={`${styles.badge} ${getRiskClass(complaintsCount)}`}>
          {getRiskLevel(complaintsCount)}
        </span>
      </div>

      <span className={`${styles.status} ${getStatusClass(material.estado)}`}>
        {material.estado === 'suspendido'
          ? 'Suspendido'
          : material.estado === 'activo'
          ? 'Pendiente'
          : material.estado}
      </span>
    </button>
  );
}

export default MaterialListItem;