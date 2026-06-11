import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageCircle, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import styles from './PublicationsList.module.css';

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
      <Icon size={14} aria-hidden="true" />
      <span>
        {label}
        {eventSubject ? ` · ${eventSubject}` : ''}
      </span>
    </Badge>
  );
}

function PostHeader({ authorId, authorInitials, authorImage, authorName, date, eventType, eventSubject }) {
  return (
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
        <time className={styles.date}>{date}</time>
      </div>

      <button type="button" className={styles.moreBtn} aria-label="Más opciones">
        ...
      </button>
    </header>
  );
}

function PostActions({
  postId,
  likes,
  dislikes,
  comments,
  userReaction,
  onLike,
  onDislike,
  onComment,
}) {
  const showDislike = typeof dislikes === 'number' || typeof onDislike === 'function';
  const showComments = typeof comments === 'number' || typeof onComment === 'function';

  return (
    <footer className={styles.actions}>
      <button
        type="button"
        className={`${styles.socialBtn} ${userReaction === 'like' ? styles.socialBtnActive : ''}`}
        onClick={() => onLike?.(postId)}
      >
        <ThumbsUp size={16} aria-hidden="true" />
        <span>{likes ?? 0}</span>
      </button>

      {showDislike && (
        <button
          type="button"
          className={`${styles.socialBtn} ${userReaction === 'dislike' ? styles.socialBtnActive : ''}`}
          onClick={() => onDislike?.(postId)}
        >
          <ThumbsDown size={16} aria-hidden="true" />
          <span>{dislikes ?? 0}</span>
        </button>
      )}

      {showComments && (
        <button
          type="button"
          className={styles.socialBtn}
          onClick={() => onComment?.(postId)}
        >
          <MessageCircle size={16} aria-hidden="true" />
          <span>{comments ?? 0}</span>
        </button>
      )}
    </footer>
  );
}

function Publication({ post, userReaction, onLike, onDislike, onComment }) {
  const {
    id,
    authorId,
    authorInitials,
    authorImage,
    authorName,
    date,
    content,
    likes,
    dislikes,
    comments,
    eventType,
    eventSubject,
  } = post;

  return (
    <article className={styles.publication}>
      <PostHeader
        authorId={authorId}
        authorInitials={authorInitials}
        authorImage={authorImage}
        authorName={authorName}
        date={date}
        eventType={eventType}
        eventSubject={eventSubject}
      />

      <p className={styles.content}>{content}</p>

      <PostActions
        postId={id}
        likes={likes}
        dislikes={dislikes}
        comments={comments}
        userReaction={userReaction}
        onLike={onLike}
        onDislike={onDislike}
        onComment={onComment}
      />
    </article>
  );
}

function PublicationsList({
  publications,
  userReactions,
  onLike,
  onDislike,
  onComment,
  title = 'Publicaciones',
  emptyMessage = 'No hay publicaciones',
}) {
  const hasPublications = publications && publications.length > 0;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>

      {hasPublications ? (
        <div className={styles.list}>
          {publications.map((post) => (
            <Publication
              key={post.id}
              post={post}
              userReaction={userReactions?.[post.id] ?? null}
              onLike={onLike}
              onDislike={onDislike}
              onComment={onComment}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{emptyMessage}</p>
      )}
    </section>
  );
}

export default PublicationsList;
