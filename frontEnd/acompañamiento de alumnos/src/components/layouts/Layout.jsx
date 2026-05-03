import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Navbar from '../navbar/Navbar';
import './Layout.css';

function Layout({
  navbarBrand,
  navbarLinks,
  headerBrand = 'SIVA UNAHUR',
}) {
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
      <Header
        brand={headerBrand}
        onMenuToggle={handleMenuToggle}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        isSidebarOpen={sidebarOpen}
      />

      <aside className={`layout__sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Navbar
          brand={navbarBrand}
          links={navbarLinks}
          onClose={handleClose}
        />
      </aside>

      {sidebarOpen && (
        <div className="layout__overlay" onClick={handleClose} />
      )}

      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;