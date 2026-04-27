import { Home, BarChart3, Users, GraduationCap, FileStack, FileWarning } from 'lucide-react';

export const adminLinks = [
  { path: '/admin/home', label: 'Home', icon: Home },
  { path: '/admin/statistics', label: 'Estadisticas', icon: BarChart3 },
  { path: '/admin/admins', label: 'Gestionar Administradores', icon: Users },
  { path: '/admin/careers', label: 'Gestionar Carreras', icon: GraduationCap },
  { path: '/admin/study-plan', label: 'Gestionar Planes De Estudio', icon: FileStack },
  { path: '/admin/reports', label: 'Gestionar Denuncias', icon: FileWarning },
];