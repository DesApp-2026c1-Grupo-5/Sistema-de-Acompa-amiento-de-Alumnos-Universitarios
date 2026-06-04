import { MapPin, Users, Globe, SquarePen, Mail, Lock, Camera, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import FormModal from '../common/FormModal';
import Avatar from '../common/Avatar';
import styles from './ProfileHeader.module.css';

function ProfileHeader({
  user,
  onEditProfile,
  onToggleVisibility,
  onUploadAvatar,
  onDeleteAvatar,
  onUploadBanner,
  onDeleteBanner,
}) {
  const { initials, name, career, location, contactsCount, email, academicStatus, privacidad, foto_url, banner_url } = user;
  const isPublic = privacidad === 'publico';

  const [modalOpen, setModalOpen] = useState(false);
  const fotoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadAvatar?.(file);
    e.target.value = '';
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadBanner?.(file);
    e.target.value = '';
  };

  const fields = [
    { name: 'name', label: 'Nombre completo', type: 'text', required: true },
    {
      name: 'career',
      label: 'Carrera',
      type: 'autocomplete',
      options: [
        'Carrera no definida',
        'Ingeniería en Sistemas',
        'Licenciatura en Administración',
        'Medicina',
        'Derecho',
        'Arquitectura',
      ],
    },
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
      <div
        className={styles.gradientHeader}
        style={banner_url ? { backgroundImage: `url(${banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className={styles.bannerActions}>
          <button
            type="button"
            className={styles.imgButton}
            title="Cambiar banner"
            onClick={() => bannerInputRef.current?.click()}
          >
            <Camera size={16} />
          </button>
          {banner_url && (
            <button
              type="button"
              className={styles.imgButton}
              title="Eliminar banner"
              onClick={() => onDeleteBanner?.()}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className={styles.avatarWrapper}>
          <Avatar initials={initials} src={foto_url || ''} size="xl" className={styles.avatar} />
          <div className={styles.avatarActions}>
            <button
              type="button"
              className={styles.imgButton}
              title="Cambiar foto"
              onClick={() => fotoInputRef.current?.click()}
            >
              <Camera size={16} />
            </button>
            {foto_url && (
              <button
                type="button"
                className={styles.imgButton}
                title="Eliminar foto"
                onClick={() => onDeleteAvatar?.()}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <input
          ref={fotoInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFotoChange}
        />
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleBannerChange}
        />
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