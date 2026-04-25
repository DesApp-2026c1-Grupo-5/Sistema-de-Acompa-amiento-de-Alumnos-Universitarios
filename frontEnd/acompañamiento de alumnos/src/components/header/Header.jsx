import { useState } from 'react';
import { Menu, Bell, Moon, Sun, User, School } from 'lucide-react';
import './Header.css';

function Header({ onMenuToggle, isDarkMode, onToggleTheme }) {
  const [notifications] = useState(3);

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__hamburger" onClick={onMenuToggle} aria-label="Abrir menú">
          <Menu size={24} />
        </button>
        <div className="header__brand">
          <School className="header__brand-icon" size={28} />
          <span className="header__brand-text">UNAHUR</span>
        </div>
      </div>
      <div className="header__right">
        <button className="header__icon-btn" aria-label="Notificaciones">
          <Bell size={20} />
          {notifications > 0 && (
            <span className="header__badge">{notifications}</span>
          )}
        </button>
        <button className="header__icon-btn" onClick={onToggleTheme} aria-label="Cambiar tema">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="header__user-btn" aria-label="Perfil de usuario">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;