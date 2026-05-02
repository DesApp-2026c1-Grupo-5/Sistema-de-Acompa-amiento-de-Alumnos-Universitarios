import {
  Home,
  User,
  GraduationCap,
  CalendarDays,
  Clock,
  FileText,
  Users,
  Settings,
  X,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const DEFAULT_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'academic', label: 'Mi situación académica', icon: GraduationCap },
  { id: 'planner', label: 'Planificador de cursada', icon: CalendarDays },
  { id: 'sessions', label: 'Sesiones de estudio', icon: Clock },
  { id: 'materials', label: 'Materiales', icon: FileText },
  { id: 'contacts', label: 'Contactos', icon: Users },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

function Sidebar({
  isOpen,
  onClose,
  activeId = 'materials',
  items = DEFAULT_ITEMS,
  brand = 'SIVA',
  onSelect,
}) {
  const handleClick = (item) => {
    if (onSelect) onSelect(item);
    if (onClose) onClose();
  };

  return (
    <>
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.head}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden="true">🎓</div>
            <span className={styles.brandText}>{brand}</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          <ul className={styles.list}>
            {items.map((it) => {
              const Icon = it.icon;
              const active = it.id === activeId;
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    className={`${styles.link} ${active ? styles.active : ''}`}
                    onClick={() => handleClick(it)}
                  >
                    <Icon size={18} className={styles.linkIcon} />
                    <span>{it.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default Sidebar;
