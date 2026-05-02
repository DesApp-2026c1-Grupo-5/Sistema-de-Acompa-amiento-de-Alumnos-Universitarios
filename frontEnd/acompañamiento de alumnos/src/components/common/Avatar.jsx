import styles from './Avatar.module.css';

function Avatar({
  initials,
  src = '',
  alt = 'Avatar de usuario',
  size = 'md',
  className = '',
}) {
  const classes = [
    styles.avatar,
    styles[`size_${size}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} aria-label={alt}>
      {src ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        initials
      )}
    </div>
  );
}

export default Avatar;