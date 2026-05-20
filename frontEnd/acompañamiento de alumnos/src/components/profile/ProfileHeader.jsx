import { MapPin, Users, Globe, SquarePen, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import FormModal from '../common/FormModal';
import Avatar from '../common/Avatar';
import styles from './ProfileHeader.module.css';

function ProfileHeader({ user, onEditProfile, onToggleVisibility }) {
  const { initials, name, career, location, contactsCount, email, academicStatus, privacidad } = user;
  const isPublic = privacidad === 'publico';

  const [modalOpen, setModalOpen] = useState(false);

  const fields = [
    { name: 'name', label: 'Nombre completo', type: 'text', required: true },
    { name: 'career', label: 'Carrera', type: 'text', readOnly: true },
    { name: 'location', label: 'Ubicación', type: 'text', readOnly: true },
    { name: 'email', label: 'Email', type: 'email', readOnly: true },
    { name: 'academicStatus', label: 'Estado académico', type: 'text', readOnly: true },
    { name: 'bio', label: 'Biografía', type: 'textarea' },
  ];

  const handleSubmit = (data) => {
    onEditProfile?.(data);
    setModalOpen(false);
  };

  return (
    <section className={styles.card}>
      <div className={styles.gradientHeader}>
        <Avatar initials={initials} size="xl" className={styles.avatar} />
      </div>

      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.info}>
            <h1 className={styles.name}>{name}</h1>
            <p className={styles.career}>{career}</p>

            <p className={styles.metaRow}>
              {location && (
                <span className={styles.metaItem}>
                  <MapPin className={styles.metaIcon} />
                  {location}
                </span>
              )}

              <span className={styles.metaItem}>
                <Users className={styles.metaIcon} />
                {contactsCount} contactos
              </span>
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnPublico}
              onClick={() => onToggleVisibility?.()}
            >
              {isPublic ? <Globe size={16} /> : <Lock size={16} />}
              {isPublic ? 'Público' : 'Privado'}
            </button>

            <button
              type="button"
              className={styles.btnEdit}
              onClick={() => setModalOpen(true)}
            >
              <SquarePen className={styles.btnIcon} />
              Editar perfil
            </button>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.detailItem}>
          <Mail className={styles.detailIcon} />
          <div>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{email}</span>
          </div>
        </div>

        <div className={styles.detailItem}>
          <Users className={styles.detailIcon} />
          <div>
            <span className={styles.detailLabel}>Estado académico</span>
            <span className={styles.detailValue}>{academicStatus}</span>
          </div>
        </div>
      </div>

      <FormModal
        open={modalOpen}
        title="Editar perfil"
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        fields={fields}
        initialValues={user}
      />
    </section>
  );
}

export default ProfileHeader;