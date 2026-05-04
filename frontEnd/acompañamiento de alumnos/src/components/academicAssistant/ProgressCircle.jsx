import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './ProgressCircle.module.css';

const COLORS = ['#00bcd4', '#e5e7eb'];

function ProgressCircle({ percentage, label }) {
  const data = [
    { name: 'Completado', value: percentage },
    { name: 'Restante', value: 100 - percentage }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.circle}>
        <ResponsiveContainer width={96} height={96}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={32}
              outerRadius={40}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.text}>
          {percentage}%
        </div>
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}

export default ProgressCircle;