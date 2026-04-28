import styles from './Badge.module.css';

function Badge({ children, variant = 'tag', className = '' }) {
  const classes = [styles.badge, styles[`variant_${variant}`], className]
    .filter(Boolean)
    .join(' ');
  return <span className={classes}>{children}</span>;
}

export default Badge;
