import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../navbar/AdminNavbar';
import Header from '../header/Header';
import './Layout.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">

      <div className={`layout__body ${sidebarOpen ? 'has-sidebar' : ''}`}>
        <aside className={`layout__sidebar ${sidebarOpen ? 'open' : ''}`}>
          <AdminNavbar onClose={handleClose}/>
        </aside>
        <main className="layout__content">
          <Header
            onMenuToggle={handleMenuToggle}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
          />
          <Outlet />
        </main>
      </div>
      {sidebarOpen && <div className="layout__overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default AdminLayout;