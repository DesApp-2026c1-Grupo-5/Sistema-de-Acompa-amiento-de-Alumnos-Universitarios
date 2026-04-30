import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import './Navbar.css';

function Navbar({ brand, links = [], onClose }) {
  return (
    <nav className="navbar">
      <div className="navbar__header">
        <span className="navbar__brand">{brand}</span>

        <button
          className="navbar__close"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      <ul className="navbar__list">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`
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