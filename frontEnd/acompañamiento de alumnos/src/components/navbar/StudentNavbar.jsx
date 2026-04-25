import { NavLink } from 'react-router-dom';
import { Home, User, GraduationCap, Bot, Clock, FileText, X } from 'lucide-react';
import './Navbar.css';

function StudentNavbar({ onClose }) {
  return (
    <nav className="navbar">
      <div className="navbar__header">
        <span className="navbar__brand">Estudiante</span>
        <button className="navbar__close" onClick={onClose} aria-label="Cerrar menú">
          <X size={20} />
        </button>
      </div>
      <ul className="navbar__list">
        <li>
          <NavLink to="/student/home" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <Home size={20} />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/profile" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <User size={20} />
            <span>Mi Perfil</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/academic-status" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <GraduationCap size={20} />
            <span>Mi Situacion Academica</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/academic-assistant" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <Bot size={20} />
            <span>Asistente Academico</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/study-sessions" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <Clock size={20} />
            <span>Sesiones De Estudio</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/materials" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
            <FileText size={20} />
            <span>Materiales</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default StudentNavbar;