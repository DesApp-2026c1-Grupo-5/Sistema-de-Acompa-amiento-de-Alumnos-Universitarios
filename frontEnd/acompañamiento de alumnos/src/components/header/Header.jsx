import { useState } from 'react';
import { Menu, Bell, Moon, User, GraduationCap } from 'lucide-react';
import styles from './Header.module.css';

function Header({
  onMenuToggle,
  onToggleTheme,
  isSidebarOpen,
  brand = 'SIVA UNAHUR',
}) {
  const [notifications] = useState(3);

  return (
    <header className={styles.header}>
      <div className={styles.header__left}>
        {!isSidebarOpen && (
          <button
            className={styles.header__hamburger}
            onClick={onMenuToggle}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        )}

        <div className={styles.header__brand}>
          <div className={styles.header__brandLogo}>
            <GraduationCap size={22} />
          </div>

          <span className={styles.header__brandText}>{brand}</span>
        </div>
      </div>

      <div className={styles.header__right}>
        <button className={styles.header__iconBtn} aria-label="Notificaciones">
          <Bell size={20} />
          {notifications > 0 && <span className={styles.header__notificationDot} />}
        </button>

        <button
          className={styles.header__iconBtn}
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
        >
          <Moon size={20} />
        </button>

        <button className={styles.header__userBtn} aria-label="Perfil de usuario">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;