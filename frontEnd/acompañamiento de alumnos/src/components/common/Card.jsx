import styles from './Card.module.css';

function Card({ 
  children, 
  title,
  className = '',
  headerAction = null
}) {
  const classes = [styles.card, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      {(title || headerAction) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {headerAction}
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </section>
  );
}

export default Card;