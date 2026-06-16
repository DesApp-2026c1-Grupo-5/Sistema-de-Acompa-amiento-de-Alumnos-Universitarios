import { Link } from 'react-router-dom';
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  BookOpen,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatRelativeTime } from '../../pages/student/home/helpers';
import styles from './FeedPost.module.css';

const EVENT_META = {
  enrollment: { label: 'Inscripción', variant: 'tagSoft', Icon: BookOpen },
  approved: { label: 'Materia aprobada', variant: 'success', Icon: CheckCircle2 },
  regular: { label: 'Regularizó', variant: 'subject', Icon: TrendingUp },
};

function EventBadge({ eventType, eventSubject }) {
  const meta = EVENT_META[eventType];
  if (!meta) return null;
  const { label, variant, Icon } = meta;
  return (
    <Badge variant={variant} className={styles.eventBadge}>
      <Icon size={13} aria-hidden="true" />
      <span>
        {label}
        {eventSubject ? ` · ${eventSubject}` : ''}
      </span>
    </Badge>
  );
}

function FeedPost({ post, userReaction, onLike, onDislike, onReport, currentUserId }) {
  const {
    id,
    authorId,
    authorName,
    authorInitials,
    authorImage,
    createdAt,
    content,
    likes = 0,
    dislikes = 0,
    eventType,
    eventSubject,
  } = post;

  const isLikeActive = userReaction === 'like';
  const isDislikeActive = userReaction === 'dislike';
  const isOwnPost = currentUserId && authorId === currentUserId;
  const canReport = !isOwnPost && !post.miDenunciaPendiente;
  const reportLabel = isOwnPost ? 'Tu publicación' : post.miDenunciaPendiente ? 'Ya denunciado' : 'Denunciar';
  const reportTitle = isOwnPost
    ? 'No podés denunciar tu propia publicación'
    : post.miDenunciaPendiente
      ? 'Ya denunciaste esta publicación'
      : 'Denunciar publicación';

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <Avatar initials={authorInitials} src={authorImage} size="md" />

        <div className={styles.meta}>
          <div className={styles.authorRow}>
            <Link to={`/student/profile/${authorId}`} className={styles.authorLink}>
              <span className={styles.author}>{authorName}</span>
            </Link>
            {eventType && (
              <EventBadge eventType={eventType} eventSubject={eventSubject} />
            )}
          </div>
          <time className={styles.time} dateTime={createdAt}>
            {formatRelativeTime(createdAt)}
          </time>
        </div>

      </header>

      <p className={styles.content}>{content}</p>

      <footer className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${isLikeActive ? styles.actionBtnActive : ''}`}
          onClick={() => onLike?.(id)}
          aria-pressed={isLikeActive}
        >
          <ThumbsUp size={16} aria-hidden="true" />
          <span>{likes}</span>
        </button>

        <button
          type="button"
          className={`${styles.actionBtn} ${isDislikeActive ? styles.actionBtnActive : ''}`}
          onClick={() => onDislike?.(id)}
          aria-pressed={isDislikeActive}
        >
          <ThumbsDown size={16} aria-hidden="true" />
          <span>{dislikes}</span>
        </button>

        <button
          type="button"
          className={`${styles.actionBtn} ${styles.reportBtn}`}
          onClick={() => onReport?.(id)}
          disabled={!canReport}
          aria-label={reportTitle}
          title={reportTitle}
        >
          <Flag size={16} aria-hidden="true" />
          <span>{reportLabel}</span>
        </button>
      </footer>
    </article>
  );
}

export default FeedPost;
