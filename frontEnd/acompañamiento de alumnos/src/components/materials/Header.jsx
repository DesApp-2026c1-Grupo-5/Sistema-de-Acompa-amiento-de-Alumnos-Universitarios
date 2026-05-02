import { Menu, Bell, Moon, Sun } from 'lucide-react';
import styles from './Header.module.css';

function Header({
    onMenuToggle,
    isDark,
    onToggleTheme,
    notifications = 1,
    userInitials = 'FG',
    brand = 'SIVA',
 }) {

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onMenuToggle}
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true">🎓</div>
          <span className={styles.brandText}>{brand}</span>
        </div>
      </div>

      <div className={styles.right}>
        <button type="button" className={styles.iconBtn} aria-label="Notificaciones">
          <Bell size={20} />
          {notifications > 0 && <span className={styles.dot} />}
        </button>
        <button
            type="button"
            className={styles.iconBtn}
            onClick={onToggleTheme}
            aria-label="Cambiar tema"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button type="button" className={styles.avatar} aria-label="Perfil de usuario">
          {userInitials}
        </button>
      </div>
    </header>
  );
}

export default Header;
