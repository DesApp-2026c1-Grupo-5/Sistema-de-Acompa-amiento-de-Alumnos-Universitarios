import { useState } from 'react';
import { Plus, X } from 'lucide-react';
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

function ContactList({ contacts, onAddContact }) {
  const [showAllContacts, setShowAllContacts] = useState(false);
  const hasContacts = contacts && contacts.length > 0;

  return (
    <>
      <section className={styles.section}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>Contactos</h2>

            <button
              type="button"
              className={styles.addButton}
              onClick={onAddContact}
              aria-label="Buscar usuarios"
            >
              <Plus size={20} />
            </button>
          </div>

          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => setShowAllContacts(true)}
          >
            Ver todos
          </button>
        </div>

        {hasContacts ? (
          <ul className={styles.grid}>
            {contacts.slice(0, 6).map((contact) => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No hay contactos</p>
        )}
      </section>

      {showAllContacts && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setShowAllContacts(false)}
          />

          <section className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Todos los contactos</h2>
                <p>{contacts?.length || 0} contactos agregados</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowAllContacts(false)}
              >
                <X size={20} />
              </button>
            </div>

            {hasContacts ? (
              <ul className={styles.contactList}>
                {contacts.map((contact) => (
                  <li key={contact.id} className={styles.contactRow}>
                    <Avatar
                      initials={contact.initials}
                      src={contact.foto_url}
                      size="md"
                    />

                    <span>{contact.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>No hay contactos</p>
            )}
          </section>
        </>
      )}
    </>
  );
}

export default ContactList;