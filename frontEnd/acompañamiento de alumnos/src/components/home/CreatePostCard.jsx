import { useState } from 'react';
import { Send } from 'lucide-react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import styles from './CreatePostCard.module.css';

function CreatePostCard({ user, onPublish }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onPublish?.(trimmed);
    setContent('');
  };

  const disabled = content.trim().length === 0;

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <Avatar initials={user.initials} size="md" />

        <textarea
          className={styles.textarea}
          placeholder="¿Qué querés compartir?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
      </div>

      <div className={styles.footer}>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={disabled}
          iconRight={<Send size={16} aria-hidden="true" />}
        >
          Publicar
        </Button>
      </div>
    </form>
  );
}

export default CreatePostCard;
