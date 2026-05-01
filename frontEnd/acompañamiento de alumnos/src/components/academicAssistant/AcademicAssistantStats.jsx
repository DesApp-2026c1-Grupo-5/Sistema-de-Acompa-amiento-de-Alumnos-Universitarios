import { CircleCheckBig, Clock, CircleAlert, Award, Target, BookOpen } from 'lucide-react';
import StatCard from '../common/StatCard';
import styles from './AcademicAssistantStats.module.css';

const statConfig = [
  { icon: CircleCheckBig, color: '#22c55e', label: 'Aprobadas', key: 'approved' },
  { icon: Clock, color: '#eab308', label: 'Regularizadas', key: 'regularized' },
  { icon: CircleAlert, color: '#ef4444', label: 'Pendientes', key: 'pending' },
  { icon: Award, color: '#06b6d4', label: 'Créditos obtenidos', key: 'creditsObtained' },
  { icon: Target, color: '#a855f7', label: 'Créditos faltantes', key: 'creditsMissing' },
  { icon: BookOpen, color: '#14b8a6', label: 'Materias UNAHUR', key: 'unahurSubjects' }
];

function AcademicAssistantStats({ stats }) {
  return (
    <div className={styles.container}>
      {statConfig.map((config) => (
        <StatCard
          key={config.key}
          title={config.label}
          value={stats[config.key]}
          icon={<config.icon size={22} color={config.color} />}
        />
      ))}
    </div>
  );
}

export default AcademicAssistantStats;