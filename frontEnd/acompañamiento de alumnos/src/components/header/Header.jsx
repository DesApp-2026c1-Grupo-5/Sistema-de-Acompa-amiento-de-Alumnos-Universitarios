import { useEffect, useState } from 'react';
import { Menu, Bell, Moon, User, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

function Header({
  onMenuToggle,
  onToggleTheme,
  isSidebarOpen,
  brand = 'SIVA UNAHUR',
}) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const savedNotifications = localStorage.getItem('student_notifications');

        if (savedNotifications) {
          const parsedNotifications = JSON.parse(savedNotifications);

          setNotifications(
            parsedNotifications.filter((notification) => !notification.read).length
          );

          return;
        }

        const response = await fetch('/data/notifications.json');

        if (!response.ok) {
          throw new Error('No se pudieron cargar las notificaciones');
        }

        const data = await response.json();

        localStorage.setItem('student_notifications', JSON.stringify(data));

        setNotifications(
          data.filter((notification) => !notification.read).length
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadUnreadCount();

    window.addEventListener('notifications-updated', loadUnreadCount);

    return () => {
      window.removeEventListener('notifications-updated', loadUnreadCount);
    };
  }, []);

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
        <button
          className={styles.header__iconBtn}
          aria-label="Notificaciones"
          onClick={() => navigate('/student/notifications')}
        >
          <Bell size={20} />

          {notifications > 0 && (
            <span className={styles.header__notificationBadge}>
              {notifications}
            </span>
          )}
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