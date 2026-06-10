// frontEnd/src/components/privacy/CollapsibleItem.jsx

import { ChevronDown } from 'lucide-react';
import styles from './CollapsibleItem.module.css';

function CollapsibleItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={styles.item}>
      <button
        type="button"
        className={styles.trigger}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{question}</span>

        <ChevronDown
          size={20}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>

      {isOpen && <div className={styles.panel}>{answer}</div>}
    </div>
  );
}

export default CollapsibleItem;