// frontEnd/src/components/privacy/PrivacySidebar.jsx

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './PrivacySidebar.module.css';

function PrivacySidebar({ sections, activeId, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (id) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <aside className={styles.sidebar}>
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
        Índice de privacidad
      </button>

      <nav
        className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}
        aria-label="Índice de privacidad"
      >
        <p className={styles.navTitle}>Contenido</p>

        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`${styles.navItem} ${
              activeId === section.id ? styles.active : ''
            }`}
            onClick={() => handleNavigate(section.id)}
          >
            {section.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default PrivacySidebar;