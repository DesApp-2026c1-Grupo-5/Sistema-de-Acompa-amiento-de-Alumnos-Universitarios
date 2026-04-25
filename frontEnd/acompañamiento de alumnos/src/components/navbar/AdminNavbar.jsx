import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Users, GraduationCap, FileStack, FileWarning } from 'lucide-react';
import './Navbar.css';

function AdminNavbar() {
  return (
    <nav className="navbar">
      <div className="navbar__brand">Administrador</div>
      <ul className="navbar__list">
        <li>
          <NavLink to="/admin/home" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <Home size={20} />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/statistics" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <BarChart3 size={20} />
            <span>Estadisticas</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/admins" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <Users size={20} />
            <span>Gestionar Administradores</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/careers" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <GraduationCap size={20} />
            <span>Gestionar Carreras</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/study-plan" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <FileStack size={20} />
            <span>Gestionar Planes De Estudio</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/reports" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <FileWarning size={20} />
            <span>Gestionar Denuncias</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavbar;