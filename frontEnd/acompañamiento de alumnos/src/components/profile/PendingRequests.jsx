import Avatar from '../common/Avatar';
import Card from '../common/Card';
import styles from './PendingRequests.module.css';
import { useState } from 'react';
import Button from '../common/Button';

function RequestItem({ request, onAccept, onIgnore }) {
  return (
    <li className={styles.item}>
      <Avatar
        initials={request.initials}
        size="md"
        className={styles.avatar}
      />
      <div className={styles.info}>
        <span className={styles.name}>{request.name}</span>
        <span className={styles.common}>
          {request.commonContacts} contactos en común
        </span>
      </div>
      <div className={styles.actions}>
        <Button
          variant="primary"
          onClick={() => onAccept?.(request.id)}
        >
          Aceptar
        </Button>
        <Button
          variant="outline"
          onClick={() => onIgnore?.(request.id)}
        >
          Ignorar
        </Button>
      </div>
    </li>
  );
}

function PendingRequests({ requests }) {
  const hasRequests = requests && requests.length > 0;

  const [currentRequests, setCurrentRequests] = useState(requests)

  const handleOnAccept = (id) => {
    setCurrentRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleOnIgnore = (id) => {
    setCurrentRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Card title={"Solicitudes pendientes"}>
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
    </Card>
  );
}

export default PendingRequests;