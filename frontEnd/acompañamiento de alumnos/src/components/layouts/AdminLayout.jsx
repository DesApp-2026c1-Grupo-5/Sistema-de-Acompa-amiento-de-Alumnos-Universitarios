import { Outlet } from 'react-router-dom';
import AdminNavbar from '../navbar/AdminNavbar';
import './Layout.css';

function AdminLayout() {
  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <AdminNavbar />
      </aside>
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;