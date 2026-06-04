import Avatar from '../common/Avatar';
import styles from './ContactList.module.css';

function ContactItem({ contact }) {
  return (
    <li className={styles.item}>
      <Avatar initials={contact.initials} src={contact.foto_url} size="md" />
      <span className={styles.name}>{contact.name}</span>
    </li>
  );
}

function ContactList({ contacts, onViewAll }) {
  const hasContacts = contacts && contacts.length > 0;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Contactos</h2>

        <button type="button" className={styles.linkBtn} onClick={onViewAll}>
          Ver todos
        </button>
      </div>

      {hasContacts ? (
        <ul className={styles.grid}>
          {contacts.map((contact) => (
            <ContactItem key={contact.id} contact={contact} />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No hay contactos</p>
      )}
    </section>
  );
}

export default ContactList;