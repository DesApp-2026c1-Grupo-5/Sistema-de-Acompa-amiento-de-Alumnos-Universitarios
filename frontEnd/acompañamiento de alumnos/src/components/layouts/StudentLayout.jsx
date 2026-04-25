import { Outlet } from 'react-router-dom';
import StudentNavbar from '../navbar/StudentNavbar';
import './Layout.css';

function StudentLayout() {
  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <StudentNavbar />
      </aside>
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;