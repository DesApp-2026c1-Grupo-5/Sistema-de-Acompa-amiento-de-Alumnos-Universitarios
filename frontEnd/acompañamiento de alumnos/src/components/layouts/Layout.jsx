import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Navbar from '../navbar/Navbar';
import './Layout.css';

function Layout({ navbarBrand, navbarLinks }) {
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
          <Navbar brand={navbarBrand} links={navbarLinks} onClose={handleClose} />
        </aside>
        <main className="layout__content">
          <Header
            onMenuToggle={handleMenuToggle}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            isSidebarOpen={sidebarOpen}
          />
          <Outlet />
        </main>
      </div>
      {sidebarOpen && <div className="layout__overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default Layout;