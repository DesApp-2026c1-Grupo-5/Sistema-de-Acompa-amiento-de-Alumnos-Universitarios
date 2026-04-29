import { MapPin, Users, Globe, SquarePen, Mail } from 'lucide-react';
import { useState } from 'react';
import FormModal from '../common/FormModal';
import Avatar from '../common/Avatar';
import Card from '../common/Card';
import styles from './ProfileHeader.module.css';
import Button from '../common/Button';

function ProfileHeader({ user, onEditProfile, onToggleVisibility }) {
  const { initials, name, career, location, contactsCount, email, academicStatus } = user;

  const [modalOpen, setModalOpen] = useState(false);

  const fields = [
    { name: 'name', label: 'Nombre completo', type: 'text', required: true },
    { name: 'career', label: 'Carrera', type: 'text', required: true },
    { name: 'location', label: 'Ubicación', type: 'text' },
    { name: 'email', label: 'Email', type: 'mail' },
    { name: 'academicStatus', label: 'Estado académico', type: 'text' },
    { name: 'bio', label: 'Biografía', type: 'textarea' },
  ];

  const handleSubmit = (data) => {
    console.log('Datos enviados:', data);
  };

  return (
    <Card className={styles.card}>
      <div className={styles.gradientHeader}>
        <Avatar
          initials={initials}
          size="xl"
          className={styles.avatar}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.info}>
            <h1 className={styles.name}>{name}</h1>
            <p className={styles.career}>{career}</p>
            <p className={styles.metaRow}>
              <span className={styles.metaItem}>
                <MapPin className={styles.metaIcon} />
                {location}
              </span>
              <span className={styles.metaItem}>
                <Users className={styles.metaIcon} />
                {contactsCount} contactos
              </span>
            </p>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.btnPublico}
              onClick={onToggleVisibility}
            >
              <Globe className={styles.btnIcon} />
              Público
            </button>
            <Button
              variant="primary"
              onClick={() => setModalOpen(true)}
            >
              <SquarePen className={styles.btnIcon} />
              Editar perfil
            </Button>
          </div>
        </div>

        <hr className={styles.divider} />


        <div className={styles.detailItem}>
          <Mail className={styles.detailIcon} />
          <dd>
            <span >Email</span>
            <span >{email}</span>
          </dd>
        </div>

        <div className={styles.detailItem}>
          <Users className={styles.detailIcon} />
          <dd>
            <span>Estado académico</span>
            <span>{academicStatus}</span>
          </dd>
        </div>

      </div>
      <FormModal
        open={modalOpen}
        title="Contacto"
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        fields={fields}
        initialValues={user}
      />
    </Card>

  );
}

export default ProfileHeader;