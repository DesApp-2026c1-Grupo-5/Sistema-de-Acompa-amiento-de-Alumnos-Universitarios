import { useState } from 'react';
import Avatar from '../common/Avatar';
import styles from './PendingRequests.module.css';

function RequestItem({ request, onAccept, onIgnore }) {
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
          onClick={() => onAccept?.(request.id)}
        >
          Aceptar
        </button>

        <button
          type="button"
          className={styles.btnIgnore}
          onClick={() => onIgnore?.(request.id)}
        >
          Ignorar
        </button>
      </div>
    </li>
  );
}

function PendingRequests({ requests }) {
  const [currentRequests, setCurrentRequests] = useState(requests || []);
  const hasRequests = currentRequests.length > 0;

  const handleOnAccept = (id) => {
    setCurrentRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleOnIgnore = (id) => {
    setCurrentRequests((prev) => prev.filter((r) => r.id !== id));
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