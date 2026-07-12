import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageCircle, BookOpen, CheckCircle2, TrendingUp, Trash2 } from 'lucide-react';
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

function PostHeader({ postId, authorId, authorInitials, authorImage, authorName, date, eventType, eventSubject, canDelete, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(postId);
  };

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

      <div className={styles.moreMenuWrapper} ref={menuRef}>
        <button
          type="button"
          className={styles.moreBtn}
          aria-label="Más opciones"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ...
        </button>

        {menuOpen && canDelete && (
          <div className={styles.dropdownMenu}>
            <button type="button" className={styles.dropdownItem} onClick={handleDelete}>
              <Trash2 size={16} aria-hidden="true" />
              <span>Eliminar</span>
            </button>
          </div>
        )}
      </div>
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

function Publication({ post, userReaction, currentUserId, onLike, onDislike, onComment, onDelete }) {
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
  const canDelete = currentUserId && String(authorId) === String(currentUserId);

  return (
    <article className={styles.publication}>
      <PostHeader
        postId={id}
        authorId={authorId}
        authorInitials={authorInitials}
        authorImage={authorImage}
        authorName={authorName}
        date={date}
        eventType={eventType}
        eventSubject={eventSubject}
        canDelete={canDelete}
        onDelete={onDelete}
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
  currentUserId,
  onLike,
  onDislike,
  onComment,
  onDelete,
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
              currentUserId={currentUserId}
              onLike={onLike}
              onDislike={onDislike}
              onComment={onComment}
              onDelete={onDelete}
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
