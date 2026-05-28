import {
  FileText,
  Video,
  Link as LinkIcon,
  HardDrive,
  GitBranch,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Download,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate } from '../../pages/student/materials/helpers';
import styles from './MaterialCard.module.css';

const TYPE_ICON = {
  file: FileText,
  video: Video,
  link: LinkIcon,
  drive: HardDrive,
  github: GitBranch,
  discord: MessageSquare,
};

const TYPE_VARIANT = {
  file: 'file',
  video: 'video',
  link: 'link',
  drive: 'drive',
  github: 'github',
  discord: 'discord',
};

function MaterialCard({ material, onView, onDownload, onJoinDiscord }) {
  const Icon = TYPE_ICON[material.type] || FileText;
  const isDiscord = material.type === 'discord';
  const isFile = material.type === 'file';
  const variantClass = styles[`type_${TYPE_VARIANT[material.type]}`] || '';

  return (
    <article className={`${styles.card} ${isDiscord ? styles.cardDiscord : ''}`}>
      <header className={styles.head}>
        <div className={`${styles.iconBox} ${variantClass}`}>
          <Icon size={22} aria-hidden="true" />
        </div>
        <div className={styles.headText}>
          <h3 className={styles.title}>{material.title}</h3>
          <p className={styles.subject}>{material.subject}</p>
          {isDiscord && material.discordData?.serverName && (
            <p className={styles.discordServer}>
              {material.discordData.serverName}
            </p>
          )}
        </div>
      </header>

      <p className={styles.description}>{material.description}</p>

      <div className={styles.tags}>
        {material.tags?.length > 0 ? (
          material.tags.map((tag) => (
            <Badge key={tag} variant="tag">
              #{tag}
            </Badge>
          ))
        ) : (
          <div className={styles.tagsPlaceholder} />
        )}
      </div>

      <div className={styles.meta}>
        <div className={styles.author}>
          <span className={styles.avatar}>{material.author?.initials}</span>
          <span className={styles.authorName}>{material.author?.name}</span>
        </div>
        <span className={styles.date}>{formatDate(material.publishedAt)}</span>
      </div>

      <div className={styles.divider} />

      <footer className={styles.footer}>
        <div className={styles.votes}>
          <span className={styles.voteItem} aria-label={`${material.likes} me gusta`}>
            <ThumbsUp size={16} className={styles.voteIcon} />
            <span>{material.likes}</span>
          </span>
          <span className={styles.voteItem} aria-label={`${material.dislikes} no me gusta`}>
            <ThumbsDown size={16} className={styles.voteIcon} />
            <span>{material.dislikes}</span>
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.viewBtn}
            onClick={() => onView?.(material)}
          >
            <Eye size={16} />
            <span>Ver</span>
          </button>

          {isFile && (
            <Button
              variant="iconCircle"
              onClick={() => onDownload?.(material)}
              aria-label="Descargar archivo"
              iconLeft={<Download size={18} />}
            />
          )}

          {isDiscord && (
            <Button
              variant="discord"
              size="sm"
              onClick={() => onJoinDiscord?.(material)}
            >
              Unirse
            </Button>
          )}
        </div>
      </footer>
    </article>
  );
}

export default MaterialCard;
