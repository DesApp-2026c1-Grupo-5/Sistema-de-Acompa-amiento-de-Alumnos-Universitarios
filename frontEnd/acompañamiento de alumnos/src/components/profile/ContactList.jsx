import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import Avatar from '../common/Avatar';
import Pagination from '../common/Pagination';
import { getProfileContacts } from '../../services/profileService';
import styles from './ContactList.module.css';

const PAGE_SIZE = 5;

function ContactItem({ contact }) {
  return (
    <li className={styles.item}>
      <Link to={`/student/profile/${contact.id}`} className={styles.contactLink}>
        <Avatar initials={contact.initials} src={contact.foto_url} size="md" />
        <span className={styles.name}>{contact.name}</span>
      </Link>
    </li>
  );
}

function ContactList({ contacts, contactsCount, estudianteId, onAddContact }) {
  const [showAllContacts, setShowAllContacts] = useState(false);
  const hasContacts = contacts && contacts.length > 0;

  const [allContacts, setAllContacts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState('');

  useEffect(() => {
    if (!showAllContacts || !estudianteId) return undefined;
    let active = true;
    (async () => {
      setLoadingAll(true);
      setErrorAll('');
      try {
        const res = await getProfileContacts(estudianteId, { page, limit: PAGE_SIZE });
        if (!active) return;
        setAllContacts(res.data ?? []);
        setTotalPages(res.pagination?.totalPages ?? 1);
      } catch (err) {
        if (active) setErrorAll(err.message || 'No pudimos cargar los contactos.');
      } finally {
        if (active) setLoadingAll(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [showAllContacts, page, estudianteId]);

  const openAllContacts = () => {
    setPage(1);
    setShowAllContacts(true);
  };

  return (
    <>
      <section className={styles.section}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>Contactos</h2>

            {onAddContact && (
              <button
                type="button"
                className={styles.addButton}
                onClick={onAddContact}
                aria-label="Buscar usuarios"
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={styles.linkBtn}
            onClick={openAllContacts}
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
                <p>{contactsCount ?? 0} contactos agregados</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowAllContacts(false)}
              >
                <X size={20} />
              </button>
            </div>

            {loadingAll ? (
              <p className={styles.empty}>Cargando contactos…</p>
            ) : errorAll ? (
              <p className={styles.empty}>{errorAll}</p>
            ) : allContacts.length > 0 ? (
              <>
                <ul className={styles.contactList}>
                  {allContacts.map((contact) => (
                    <li key={contact.id} className={styles.contactRow}>
                      <Link to={`/student/profile/${contact.id}`} className={styles.contactLink}>
                        <Avatar
                          initials={contact.initials}
                          src={contact.foto_url}
                          size="md"
                        />
                        <span>{contact.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {totalPages > 1 && (
                  <div className={styles.modalPagination}>
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                  </div>
                )}
              </>
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