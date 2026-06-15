import { Plus } from 'lucide-react';
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

function ContactList({ contacts, onViewAll, onAddContact }) {
  const hasContacts = contacts && contacts.length > 0;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Contactos</h2>

          <button
            type="button"
            className={styles.addButton}
            onClick={onAddContact}
            aria-label="Buscar usuarios"
            title="Buscar usuarios"
          >
            <Plus size={20} />
          </button>
        </div>

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