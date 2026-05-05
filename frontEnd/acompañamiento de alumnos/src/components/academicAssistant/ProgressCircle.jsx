import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './ProgressCircle.module.css';

function ProgressCircle({ percentage, label }) {
  const isDark = document.documentElement.classList.contains('dark');

  const COLORS = isDark
    ? ['#00d2d8', '#334155']
    : ['#00a8ad', '#e5e7eb'];

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
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div
          className={styles.text}
          style={{
            color: isDark ? '#ffffff' : '#020617'
          }}
        >
          {percentage}%
        </div>
      </div>

      <p
        className={styles.label}
        style={{
          color: isDark ? '#cbd5e1' : '#526987'
        }}
      >
        {label}
      </p>
    </div>
  );
}

export default ProgressCircle;