import styles from './Avatar.module.css';

function Avatar({ 
  initials, 
  size = 'md', 
  className = '' 
}) {
  const classes = [
    styles.avatar,
    styles[`size_${size}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} aria-label={`Avatar de ${initials}`}>
      {initials}
    </div>
  );
}

export default Avatar;