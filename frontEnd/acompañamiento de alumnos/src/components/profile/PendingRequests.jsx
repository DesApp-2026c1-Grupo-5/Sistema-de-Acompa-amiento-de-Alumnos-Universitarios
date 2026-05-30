import { useState } from 'react';
import Avatar from '../common/Avatar';
import { aceptarInvitacion, ignorarInvitacion } from '../../services/contactoService';
import styles from './PendingRequests.module.css';

function RequestItem({ request, disabled, onAccept, onIgnore }) {
  return (
    <li className={styles.item}>
      <Avatar initials={request.initials} size="md" />

      <div className={styles.info}>
        <span className={styles.name}>{request.name}</span>
        <span className={styles.common}>
          {request.commonContacts} contactos en común
        </span>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnAccept}
          disabled={disabled}
          onClick={() => onAccept(request.id)}
        >
          Aceptar
        </button>

        <button
          type="button"
          className={styles.btnIgnore}
          disabled={disabled}
          onClick={() => onIgnore(request.id)}
        >
          Ignorar
        </button>
      </div>
    </li>
  );
}

function PendingRequests({ requests }) {
  const [currentRequests, setCurrentRequests] = useState(requests || []);
  const [loadingId, setLoadingId] = useState(null);
  const hasRequests = currentRequests.length > 0;

  const handleOnAccept = async (id) => {
    setLoadingId(id);
    try {
      await aceptarInvitacion(id);
      setCurrentRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setLoadingId(null);
    }
  };

  const handleOnIgnore = async (id) => {
    setLoadingId(id);
    try {
      await ignorarInvitacion(id);
      setCurrentRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setLoadingId(null);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Solicitudes pendientes</h2>
        <span className={styles.count}>{currentRequests.length}</span>
      </div>

      {hasRequests ? (
        <ul className={styles.list}>
          {currentRequests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              disabled={loadingId === request.id}
              onAccept={handleOnAccept}
              onIgnore={handleOnIgnore}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No hay solicitudes pendientes</p>
      )}
    </section>
  );
}

export default PendingRequests;