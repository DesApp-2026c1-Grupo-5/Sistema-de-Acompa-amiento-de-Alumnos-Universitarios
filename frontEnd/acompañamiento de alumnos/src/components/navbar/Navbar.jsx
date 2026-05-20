import { NavLink, useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import styles from './Navbar.module.css';

function Navbar({ brand, links = [], onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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

        <li>
          <button
            type="button"
            className={`${styles.navbar__link} ${styles.navbar__logout}`}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
