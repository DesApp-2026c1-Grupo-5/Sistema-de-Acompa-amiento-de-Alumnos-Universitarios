import Card from './Card';
import Avatar from './Avatar';
import styles from './PostCard.module.css';

function PostCard({
  authorName,
  authorInitials,
  authorImage,
  date,
  content,
}) {
  return (
    <Card className={styles.postCard}>
      <div className={styles.header}>
        <Avatar initials={authorInitials} src={authorImage} size="md" />

        <div>
          <h3 className={styles.author}>{authorName}</h3>
          {date && <p className={styles.date}>{date}</p>}
        </div>
      </div>

      <p className={styles.content}>{content}</p>
    </Card>
  );
}

export default PostCard;

/*
Ejemplo de uso:

<PostCard
  authorName="Federico Breme"
  authorInitials="FB"
  date="Hace 2 horas"
  content="Aprobé Programación II. Si alguien necesita apuntes, los subo a materiales."
/>
*/