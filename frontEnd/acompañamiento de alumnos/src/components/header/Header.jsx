import { useEffect, useState } from 'react';
import { Menu, Bell, Moon, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../../services/notificacionService';
import { useAuth } from '../../context/useAuth';
import Avatar from '../common/Avatar';
import styles from './Header.module.css';

function Header({
  onMenuToggle,
  onToggleTheme,
  isSidebarOpen,
  brand = 'SIVA UNAHUR',
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(0);

  const persona = user?.estudiante ?? user?.administrador ?? null;
  const userInitials = persona
    ? `${persona.nombre?.[0] ?? ''}${persona.apellido?.[0] ?? ''}`.toUpperCase()
    : '';
  const userFoto = user?.estudiante?.foto_url ?? '';
  const goToProfile = () =>
    navigate(user?.tipo === 'administrador' ? '/admin/home' : '/student/profile');

  useEffect(() => {
    if (user?.tipo !== 'estudiante') {
      setNotifications(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const response = await getNotifications();
        setNotifications(response.summary?.unreadCount ?? 0);
      } catch (error) {
        console.error(error);
        setNotifications(0);
      }
    };

    loadUnreadCount();

    window.addEventListener('notifications-updated', loadUnreadCount);

    return () => {
      window.removeEventListener('notifications-updated', loadUnreadCount);
    };
  }, [user?.tipo]);

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
        {user?.tipo === 'estudiante' && (
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
        )}

        <button
          className={styles.header__iconBtn}
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
        >
          <Moon size={20} />
        </button>

        <button
          className={styles.header__userBtn}
          aria-label="Perfil de usuario"
          onClick={goToProfile}
        >
          <Avatar initials={userInitials} src={userFoto} size="md" />
        </button>
      </div>
    </header>
  );
}

export default Header;