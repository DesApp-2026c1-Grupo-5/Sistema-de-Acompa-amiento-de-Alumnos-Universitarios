import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Navbar from '../navbar/Navbar';
import styles from './Layout.module.css';

function Layout({
  navbarBrand,
  navbarLinks,
  headerBrand = 'SIVA UNAHUR',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const handleToggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.layout}>
      <Header
        brand={headerBrand}
        onMenuToggle={handleMenuToggle}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        isSidebarOpen={sidebarOpen}
      />

      <aside className={`${styles.layout__sidebar}${sidebarOpen ? ' ' + styles.open : ''}`}>
        <Navbar
          brand={navbarBrand}
          links={navbarLinks}
          onClose={handleClose}
        />
      </aside>

      {sidebarOpen && (
        <div className={styles.layout__overlay} onClick={handleClose} />
      )}

      <main className={styles.layout__content}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;