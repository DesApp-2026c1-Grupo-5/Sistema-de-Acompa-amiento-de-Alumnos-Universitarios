import Avatar from '../common/Avatar';
import Card from '../common/Card';
import styles from './PublicationsList.module.css';

//REVISAR TODO

function PostHeader({ authorInitials, authorName, date }) {
  return (
    <header className={styles.header}>
      <Avatar
        initials={authorInitials}
        size="md"
        className={styles.avatar}
      />
      <div className={styles.meta}>
        <span className={styles.author}>{authorName}</span>
        <time className={styles.date}>{date}</time>
      </div>
    </header>
  );
}

function PostActions({ postId, likes, comments, onLike, onComment }) {
  return (
    <footer className={styles.actions}>
      <button
        className={styles.socialBtn}
        onClick={() => onLike?.(postId)}
      >
        ❤️ {likes}
      </button>
      <button
        className={styles.socialBtn}
        onClick={() => onComment?.(postId)}
      >
        💬 {comments}
      </button>
    </footer>
  );
}

function Publication({ post, onLike, onComment }) {
  const { id, authorInitials, authorName, date, content, likes, comments } = post;

  return (
    <article className={styles.publication}>
      <PostHeader
        authorInitials={authorInitials}
        authorName={authorName}
        date={date}
      />
      <p className={styles.content}>{content}</p>
      <PostActions
        postId={id}
        likes={likes}
        comments={comments}
        onLike={onLike}
        onComment={onComment}
      />
    </article>
  );
}

function PublicationsList({ publications, onLike, onComment }) {
  const hasPublications = publications && publications.length > 0;
  const title = 'Publicaciones';

  return (
    <Card title={title}>
      {hasPublications ? (
        <div className={styles.list}>
          {publications.map((post) => (
            <Publication
              key={post.id}
              post={post}
              onLike={onLike}
              onComment={onComment}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No hay publicaciones</p>
      )}
    </Card>
  );
}

export default PublicationsList;