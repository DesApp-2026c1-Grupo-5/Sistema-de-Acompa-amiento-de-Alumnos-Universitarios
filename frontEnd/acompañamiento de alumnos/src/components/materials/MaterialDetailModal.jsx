import { ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import {
  formatDate,
  calcRatio,
} from '../../pages/student/materials/helpers';
import { TYPE_LABELS } from '../../pages/student/materials/mockData';
import styles from './MaterialDetailModal.module.css';

function MaterialDetailModal({
  open,
  material,
  onClose,
  onLike,
  onDislike,
  userVote = null,
}) {
  const navigate = useNavigate();

  if (!material) return null;

  const ratio = calcRatio(material.likes, material.dislikes);

  return (
    <Modal open={open} title="Detalle del material" onClose={onClose} size="md">
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.title}>{material.title}</h3>
          <p className={styles.subject}>{material.subject}</p>
        </div>

        {material.description && (
          <p className={styles.description}>{material.description}</p>
        )}

        <div className={styles.infoGrid}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Tipo</span>
            <span className={styles.infoValue}>
              {TYPE_LABELS[material.type] || material.type}
            </span>
          </div>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Fecha</span>
            <span className={styles.infoValue}>
              {formatDate(material.publishedAt)}
            </span>
          </div>
        </div>

        <div className={styles.authorBlock}>
          <span className={styles.infoLabel}>Subido por</span>
          <div className={styles.author}>
            <Avatar initials={material.author?.initials} src={material.author?.image} size="sm" />
            <span className={styles.authorName}>{material.author?.name}</span>
          </div>
        </div>

        {material.tags?.length > 0 && (
          <div className={styles.tagsBlock}>
            <span className={styles.infoLabel}>Tags</span>
            <div className={styles.tags}>
              {material.tags.map((t) => (
                <Badge key={t} variant="tag">
                  #{t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className={styles.ratingsBlock}>
          <span className={styles.infoLabel}>Valoraciones</span>
          <div className={styles.ratingsRow}>
            <span className={styles.likeStat}>
              <ThumbsUp size={16} className={styles.likeIcon} />
              <span>{material.likes}</span>
            </span>
            <span className={styles.dislikeStat}>
              <ThumbsDown size={16} className={styles.dislikeIcon} />
              <span>{material.dislikes}</span>
            </span>
            <span className={styles.ratio}>Ratio: {ratio}%</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${userVote === 'like' ? styles.actionBtnLike : ''}`}
            onClick={() => onLike?.(material)}
          >
            <ThumbsUp size={18} />
            <span>Me gusta</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${userVote === 'dislike' ? styles.actionBtnDislike : ''}`}
            onClick={() => onDislike?.(material)}
          >
            <ThumbsDown size={18} />
            <span>No me gusta</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.reportBtn}`}
            onClick={() => {
              onClose?.();
              navigate(`/student/report-material/${material.id}`);
            }}
            disabled={material.miDenunciaPendiente}
            title={material.miDenunciaPendiente ? 'Ya denunciaste este material' : undefined}
          >
            <Flag size={18} />
            <span>{material.miDenunciaPendiente ? 'Ya denunciado' : 'Denunciar'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default MaterialDetailModal;
