import styles from './ProgressBar.module.css';

function ProgressBar({ percentage, color = '#00bcd4' }) {
  return (
    <div className={styles.container}>
      <div
        className={styles.bar}
        style={{ 
          background: `linear-gradient(to right, ${color} ${percentage}%, #e5e7eb ${percentage}%)` 
        }}
      />
    </div>
  );
}

export default ProgressBar;