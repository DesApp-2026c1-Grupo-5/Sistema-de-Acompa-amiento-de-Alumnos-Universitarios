import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import StudentLayout from '../components/layouts/StudentLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import HomeStudent from '../pages/student/HomeStudent';
import Profile from '../pages/student/Profile';
import AcademicStatus from '../pages/student/AcademicStatus';
import AcademicAssistant from '../pages/student/AcademicAssistant';
import StudySessions from '../pages/student/StudySessions';
import Materials from '../pages/student/Materials';
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
    element: <StudentLayout />,
    children: [
      {
        path: '/student',
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
      {
        path: '/student/materials',
        element: <Materials />,
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: '/admin',
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