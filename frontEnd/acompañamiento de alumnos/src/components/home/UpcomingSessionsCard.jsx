import { Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import styles from './UpcomingSessionsCard.module.css';

function SessionItem({ session, onViewDetails }) {
  const { id, subject, topic, date, time, participantsCount, maxParticipants } = session;

  return (
    <li className={styles.item}>
      <div className={styles.itemHeader}>
        <h4 className={styles.subject}>{subject}</h4>
        {topic && <p className={styles.topic}>{topic}</p>}
      </div>

      <ul className={styles.meta}>
        <li className={styles.metaItem}>
          <Calendar size={14} aria-hidden="true" />
          <span>{date}</span>
        </li>
        <li className={styles.metaItem}>
          <Clock size={14} aria-hidden="true" />
          <span>{time}</span>
        </li>
        <li className={styles.metaItem}>
          <Users size={14} aria-hidden="true" />
          <span>
            {participantsCount}
            {typeof maxParticipants === 'number' ? `/${maxParticipants}` : ''}
          </span>
        </li>
      </ul>

      <button
        type="button"
        className={styles.detailsBtn}
        onClick={() => onViewDetails?.(id)}
      >
        <span>Ver detalles</span>
        <ChevronRight size={14} aria-hidden="true" />
      </button>
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
