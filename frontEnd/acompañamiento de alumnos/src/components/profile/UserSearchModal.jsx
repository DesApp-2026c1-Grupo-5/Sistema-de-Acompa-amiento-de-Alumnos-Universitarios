import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import Avatar from '../common/Avatar';
import { buscarUsuarios, enviarInvitacion } from '../../services/contactoService';
import styles from './UserSearchModal.module.css';

function UserSearchModal({ open, onClose }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    console.log('Modal abierto', open);
    console.log('Texto búsqueda', search);

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        console.log('Ejecutando búsqueda...');

        const res = await buscarUsuarios(search);

        console.log('Respuesta backend:', res);

        setUsers(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error('Error búsqueda:', err);

        setError(err.message || 'No pudimos buscar usuarios.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open]);

  const handleFollow = async (userId) => {
    setSendingId(userId);
    setError('');

    try {
      await enviarInvitacion(userId);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, solicitudEnviada: true }
            : user
        )
      );
    } catch (err) {
      setError(err.message || 'No pudimos enviar la solicitud.');
    } finally {
      setSendingId(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <section className={styles.modal}>
        <header className={styles.header}>
          <div>
            <h2>Buscar usuarios</h2>
            <p>Encontrá estudiantes y enviá solicitudes de contacto.</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.searchBox}>
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <div className={styles.results}>
          {loading && (
            <p className={styles.empty}>
              Buscando usuarios...
            </p>
          )}

          {!loading && users.length === 0 && (
            <p className={styles.empty}>
              No se encontraron usuarios.
            </p>
          )}

          {!loading &&
            users.map((user) => (
              <article
                key={user.id}
                className={styles.userItem}
              >
                <div className={styles.userInfo}>
                  <Avatar
                    initials={user.initials}
                    src={user.foto_url}
                    size="md"
                  />

                  <div>
                    <strong>{user.name}</strong>

                    {user.career && (
                      <span>{user.career}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.followButton}
                  disabled={
                    sendingId === user.id ||
                    user.solicitudEnviada
                  }
                  onClick={() => handleFollow(user.id)}
                >
                  {user.solicitudEnviada
                    ? 'Solicitud enviada'
                    : sendingId === user.id
                      ? 'Enviando...'
                      : 'Seguir'}
                </button>
              </article>
            ))}
        </div>
      </section>
    </>
  );
}

export default UserSearchModal;