import { useState } from 'react';
import { Calendar } from 'lucide-react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import styles from './UpcomingSessionsCard.module.css';

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const PAGE_SIZE = 3;

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

function UpcomingSessionsCard({ sessions, onViewDetails, loading = false, error = null }) {
  const hasSessions = sessions && sessions.length > 0;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((sessions?.length ?? 0) / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = (sessions ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const renderBody = () => {
    if (loading) {
      return <p className={styles.status}>Cargando sesiones…</p>;
    }

    if (error) {
      return (
        <EmptyState
          title="No pudimos cargar tus sesiones"
          description={error}
        />
      );
    }

    if (hasSessions) {
      return (
        <>
          <ul className={styles.list}>
            {paged.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                onViewDetails={onViewDetails}
              />
            ))}
          </ul>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </>
      );
    }

    return (
      <EmptyState
        title="Sin sesiones próximas"
        description="Cuando te sumes a sesiones de estudio, aparecerán acá."
      />
    );
  };

  return (
    <Card title="Mis sesiones" className={styles.card}>
      {renderBody()}
    </Card>
  );
}

export default UpcomingSessionsCard;
