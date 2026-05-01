import { PieChart, Pie, Cell } from 'recharts';
import Card from '../common/Card';
import styles from './AcademicAssistantHeader.module.css';
import academicData from '../../pages/student/academicAssistantData.json';

const COLORS = ['#00bcd4', '#e5e7eb'];

function AcademicAssistantHeader() {
  const progressData = [
    { name: 'Completado', value: academicData.progress.percentage },
    { name: 'Restante', value: 100 - academicData.progress.percentage }
  ];

  return (
    <Card>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Asistente Académico</h1>
          <p className={styles.description}>Planificá tu cursada y analizá tu progreso</p>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressCircle}>
            <PieChart width={96} height={96}>
              <Pie
                data={progressData}
                innerRadius={32}
                outerRadius={40}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
            <div className={styles.progressText}>
              {academicData.progress.percentage}%
            </div>
          </div>
          <p className={styles.progressLabel}>{academicData.progress.label}</p>
        </div>
      </div>
    </Card>
  );
}

export default AcademicAssistantHeader;