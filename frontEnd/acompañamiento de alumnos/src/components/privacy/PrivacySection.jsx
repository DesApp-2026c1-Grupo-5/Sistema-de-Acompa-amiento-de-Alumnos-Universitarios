// frontEnd/src/components/privacy/PrivacySection.jsx

import SectionAnchor from './SectionAnchor';
import styles from './PrivacySection.module.css';

function PrivacySection({
  id,
  title,
  icon: Icon,
  children,
  isHighlighted = false,
}) {
  return (
    <section
      className={`${styles.section} ${isHighlighted ? styles.highlighted : ''}`}
      aria-labelledby={`${id}-title`}
    >
      <SectionAnchor id={id} />

      <div className={styles.header}>
        {Icon && (
          <div className={styles.iconBox}>
            <Icon size={22} />
          </div>
        )}

        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
      </div>

      <div className={styles.content}>{children}</div>
    </section>
  );
}

export default PrivacySection;