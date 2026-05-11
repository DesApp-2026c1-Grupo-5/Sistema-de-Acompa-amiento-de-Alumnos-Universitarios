import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import styles from './Navbar.module.css';

function Navbar({ brand, links = [], onClose }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar__header}>
        <span className={styles.navbar__brand}>{brand}</span>

        <button
          className={styles.navbar__close}
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      <ul className={styles.navbar__list}>
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `${styles.navbar__link}${isActive ? ' ' + styles['navbar__link--active'] : ''}`
                }
              >
                {Icon && <Icon size={20} />}
                <span>{link.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Navbar;