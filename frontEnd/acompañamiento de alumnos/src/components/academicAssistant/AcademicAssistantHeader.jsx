import { PieChart, Pie, Cell } from 'recharts';
import Card from '../common/Card';
import styles from './AcademicAssistantHeader.module.css';

const COLORS = ['#00bcd4', '#e5e7eb'];

function AcademicAssistantHeader({ progress }) {
  const percentage = progress?.percentage ?? 0;
  const label = progress?.label ?? 'Avance de carrera';

  const progressData = [
    { name: 'Completado', value: percentage },
    { name: 'Restante', value: 100 - percentage }
  ];

  return (
    <Card>
      <div className={styles.container}>
        <div>
          <h1 className={styles.title}>Asistente Académico</h1>
          <p className={styles.description}>Planificá tu cursada y analizá tu progreso</p>
        </div>
        <div className={styles.progressWrapper}>
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
            <span className={styles.percentage}>{percentage}%</span>
          </div>
          <span className={styles.progressLabel}>{label}</span>
        </div>
      </div>
    </Card>
  );
}

export default AcademicAssistantHeader;