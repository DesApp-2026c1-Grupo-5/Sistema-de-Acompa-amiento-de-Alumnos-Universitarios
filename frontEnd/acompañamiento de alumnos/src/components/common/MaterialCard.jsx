import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import styles from './MaterialCard.module.css';

function MaterialCard({
  title,
  subject,
  type = 'Archivo',
  author,
  likes = 0,
  dislikes = 0,
  tags = [],
  onOpen,
}) {
  return (
    <Card className={styles.materialCard}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subject}>{subject}</p>
        </div>

        <Badge variant="typeFile">{type}</Badge>
      </div>

      {author && <p className={styles.author}>Publicado por {author}</p>}

      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <Badge key={tag} variant="tagSoft">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.votes}>
          👍 {likes} · 👎 {dislikes}
        </span>

        {onOpen && (
          <Button variant="outline" size="sm" onClick={onOpen}>
            Abrir
          </Button>
        )}
      </div>
    </Card>
  );
}

export default MaterialCard;

/*
Ejemplo de uso:

<MaterialCard
  title="Resumen unidad 1"
  subject="Programación II"
  type="PDF"
  author="Federico"
  likes={12}
  dislikes={1}
  tags={['parcial', 'resumen']}
  onOpen={() => console.log('abrir material')}
/>
*/