import Avatar from '../common/Avatar';
import Card from '../common/Card';
import styles from './ContactList.module.css';

const VIEW_ALL_TEXT = 'Ver todos';

function ContactItem({ contact }) {
  return (
    <li className={styles.item}>
      <Avatar 
        initials={contact.initials} 
        size="sm" 
        className={styles.avatar}
      />
      <span className={styles.name}>{contact.name}</span>
    </li>
  );
}

function ContactList({ contacts, onViewAll }) {
  const hasContacts = contacts && contacts.length > 0;

  return (
    <Card title={"Contactos"}>
      {hasContacts ? (
        <ul className={styles.grid}>
          {contacts.map((contact) => (
            <ContactItem key={contact.id} contact={contact} />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No hay contactos</p>
      )}
    </Card>
  );
}

export default ContactList;