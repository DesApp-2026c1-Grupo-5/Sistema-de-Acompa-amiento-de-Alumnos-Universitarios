import StatCard from '../common/StatCard';
import styles from './StatsGrid.module.css';

function StatsGrid({ stats, config }) {
  return (
    <div className={styles.grid}>
      {config.map((item) => (
        <StatCard
          key={item.key}
          title={item.label}
          value={stats[item.key]}
          icon={<item.icon size={22} color={item.color} />}
        />
      ))}
    </div>
  );
}

export default StatsGrid;