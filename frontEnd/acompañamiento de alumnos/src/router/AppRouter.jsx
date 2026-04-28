import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Layout from '../components/layouts/Layout';
import { adminLinks } from '../components/navbar/AdminNavbar';
import { studentLinks } from '../components/navbar/StudentNavbar';
import HomeStudent from '../pages/student/HomeStudent';
import Profile from '../pages/student/Profile';
import AcademicStatus from '../pages/student/AcademicStatus';
import AcademicAssistant from '../pages/student/AcademicAssistant';
import StudySessions from '../pages/student/StudySessions';
import MaterialRepositoryPage from '../pages/student/MaterialRepositoryPage';
import HomeAdmin from '../pages/admin/HomeAdmin';
import Careers from '../pages/admin/Careers';
import StudyPlan from '../pages/admin/StudyPlan';
import Reports from '../pages/admin/Reports';
import Admins from '../pages/admin/Admins';
import Statistics from '../pages/admin/Statistics';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/student/materials',
    element: <MaterialRepositoryPage />,
  },
  {
    element: <Layout navbarBrand="Estudiante" navbarLinks={studentLinks} />,
    children: [
      {
        path: '/student/home',
        element: <HomeStudent />,
      },
      {
        path: '/student/profile',
        element: <Profile />,
      },
      {
        path: '/student/academic-status',
        element: <AcademicStatus />,
      },
      {
        path: '/student/academic-assistant',
        element: <AcademicAssistant />,
      },
      {
        path: '/student/study-sessions',
        element: <StudySessions />,
      },
    ],
  },
  {
    element: <Layout navbarBrand="Administrador" navbarLinks={adminLinks} />,
    children: [
      {
        path: '/admin/home',
        element: <HomeAdmin />,
      },
      {
        path: '/admin/careers',
        element: <Careers />,
      },
      {
        path: '/admin/study-plan',
        element: <StudyPlan />,
      },
      {
        path: '/admin/reports',
        element: <Reports />,
      },
      {
        path: '/admin/admins',
        element: <Admins />,
      },
      {
        path: '/admin/statistics',
        element: <Statistics />,
      },
    ],
  },
]);

export default router;
