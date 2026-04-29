import Avatar from '../common/Avatar';
import Card from '../common/Card';
import styles from './PendingRequests.module.css';
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

function PendingRequests({ requests, onAccept, onIgnore }) {
  const hasRequests = requests && requests.length > 0;

  return (
    <Card title={"Solicitudes pendientes"}>
      {hasRequests ? (
        <ul className={styles.list}>
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              onAccept={onAccept}
              onIgnore={onIgnore}
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