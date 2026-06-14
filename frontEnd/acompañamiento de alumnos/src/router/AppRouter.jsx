import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import PrivacyPage from "../pages/public/PrivacyPage";
import TermsPage from '../pages/public/TermsPage';
import InfoNotice from '../components/cookies/InfoNotice';
import Layout from '../components/layouts/Layout';
import PrivateRoute from '../components/auth/PrivateRoute';
import { adminLinks } from '../components/navbar/AdminNavbar';
import { studentLinks } from '../components/navbar/StudentNavbar';
import HomeStudent from '../pages/student/HomeStudent';
import Profile from '../pages/student/Profile';
import SituacionAcademica from '../pages/student/SituacionAcademica';
import AcademicAssistant from '../pages/student/AcademicAssistant';
import StudySessions from '../pages/student/StudySessions';
import MaterialRepositoryPage from '../pages/student/MaterialRepositoryPage';
import HomeAdmin from '../pages/admin/Home/HomeAdmin';
import Careers from '../pages/admin/Careers';
import CareerEdit from '../pages/admin/CareerEdit';
import StudyPlan from '../pages/admin/StudyPlan';
import Admins from '../pages/admin/Admins';
import Statistics from '../pages/admin/Statistics';
import ReportMaterial from '../pages/student/ReportMaterial';
import Notifications from '../pages/student/Notifications';
import ModerationPage from '../pages/admin/ModerationPage/ModerationPage';
import ComplaintConfigPage from '../pages/admin/ComplaintConfigPage/ComplaintConfigPage';

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
    path: '/privacidad',
    element: <PrivacyPage />,
  },
  {
  path: '/terminos',
  element: <TermsPage />,
  },
  {
  path: '/cookies',
  element: <InfoNotice />,
  },
  {
    element: <PrivateRoute requiredTipo="estudiante" />,
    children: [
      {
        element: <Layout navbarBrand="Estudiante" navbarLinks={studentLinks} />,
        children: [
          {
            path: '/student/materials',
            element: <MaterialRepositoryPage />,
          },
          {
            path: '/student/home',
            element: <HomeStudent />,
          },
          {
            path: '/student/profile',
            element: <Profile />,
          },
          {
            path: '/student/profile/:userId',
            element: <Profile />,
          },
          {
            path: '/student/academic-status',
            element: <SituacionAcademica />,
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
            path: '/student/report-material/:id',
            element: <ReportMaterial />,
          },
          {
            path: '/student/notifications',
            element: <Notifications />,
          },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute requiredTipo="administrador" />,
    children: [
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
            path: '/admin/careers/:careerId/edit',
            element: <CareerEdit />,
          },
          {
            path: '/admin/study-plan/:id?',
            element: <StudyPlan />,
          },
          {
            path: '/admin/admins',
            element: <Admins />,
          },
          {
            path: '/admin/statistics',
            element: <Statistics />,
          },
          {
            path: '/admin/moderation',
            element: <ModerationPage />,
          },
          {
            path: '/admin/complaint-config',
            element: <ComplaintConfigPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
