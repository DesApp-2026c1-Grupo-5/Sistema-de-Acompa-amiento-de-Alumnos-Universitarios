import { Calendar } from 'lucide-react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import styles from './UpcomingSessionsCard.module.css';

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatShortDate(isoDate) {
  if (!isoDate) return '';
  const [, month, day] = isoDate.split('-').map((v) => parseInt(v, 10));
  if (!day || !month) return isoDate;
  return `${day} ${MONTHS_ES[month - 1]}`;
}

function SessionItem({ session, onViewDetails }) {
  const { id, subject, date, time, participantsCount } = session;

  return (
    <li className={styles.item}>
      <h4 className={styles.subject}>{subject}</h4>

      <div className={styles.dateRow}>
        <Calendar size={14} aria-hidden="true" />
        <span>
          {formatShortDate(date)}
          {time ? ` · ${time}` : ''}
        </span>
      </div>

      <div className={styles.footer}>
        <span className={styles.participants}>
          {participantsCount} participantes
        </span>

        <button
          type="button"
          className={styles.detailsBtn}
          onClick={() => onViewDetails?.(id)}
        >
          Ver detalles
        </button>
      </div>
    </li>
  );
}

function UpcomingSessionsCard({ sessions, onViewDetails }) {
  const hasSessions = sessions && sessions.length > 0;

  return (
    <Card title="Mis sesiones" className={styles.card}>
      {hasSessions ? (
        <ul className={styles.list}>
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              onViewDetails={onViewDetails}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Sin sesiones próximas"
          description="Cuando te sumes a sesiones de estudio, aparecerán acá."
        />
      )}
    </Card>
  );
}

export default UpcomingSessionsCard;
