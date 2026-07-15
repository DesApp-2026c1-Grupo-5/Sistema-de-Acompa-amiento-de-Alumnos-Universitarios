import { MapPin, Users, Globe, SquarePen, Mail, Lock, Camera, Trash2, BookOpen, CheckCircle2, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import styles from './ProfileHeader.module.css';

const AUTO_PUBLISH_OPTIONS = [
  { key: 'enrollment', label: 'Inscripción', Icon: BookOpen },
  { key: 'regular', label: 'Regularización', Icon: TrendingUp },
  { key: 'approved', label: 'Aprobación', Icon: CheckCircle2 },
];

const PROFILE_FORM_ID = 'edit-profile-form';

const normalizeSpaces = (value) => value.trim().replace(/\s+/g, ' ');

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLatestBirthDate = () => {
  const argentinaDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(
    argentinaDate.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)])
  );
  return formatDateInput(new Date(dateParts.year - 16, dateParts.month - 1, dateParts.day));
};

const validateProfile = ({ name, localidad, phone, birthDate, bio }) => {
  const errors = {};
  const fullName = normalizeSpaces(name);
  const [firstName = '', ...lastNameParts] = fullName.split(' ');
  const lastName = lastNameParts.join(' ');

  if (!fullName) {
    errors.name = 'El nombre completo es obligatorio.';
  } else if (firstName.length < 2 || lastName.length < 2) {
    errors.name = 'Ingresá nombre y apellido, con al menos 2 caracteres cada uno.';
  } else if (firstName.length > 100 || lastName.length > 100) {
    errors.name = 'El nombre y el apellido no pueden superar los 100 caracteres.';
  }

  if (localidad.trim().length > 120) {
    errors.localidad = 'La localidad no puede superar los 120 caracteres.';
  }

  if (phone.trim()) {
    const normalizedPhone = phone.trim();
    const digitCount = normalizedPhone.replace(/\D/g, '').length;

    if (!/^\+?[0-9 ()-]+$/.test(normalizedPhone)) {
      errors.phone = 'Usá solo números, espacios, paréntesis, guiones y un + inicial.';
    } else if (digitCount < 8 || digitCount > 15) {
      errors.phone = 'El teléfono debe contener entre 8 y 15 dígitos.';
    }
  }

  if (birthDate) {
    const parsedDate = new Date(`${birthDate}T00:00:00`);
    const isRealDate = !Number.isNaN(parsedDate.getTime()) && formatDateInput(parsedDate) === birthDate;

    if (!isRealDate) {
      errors.birthDate = 'Ingresá una fecha de nacimiento válida.';
    } else if (birthDate > getLatestBirthDate()) {
      errors.birthDate = 'Debés tener al menos 16 años.';
    }
  }

  if (bio.trim().length > 500) {
    errors.bio = 'La biografía no puede superar los 500 caracteres.';
  }

  return errors;
};

const API_FIELD_MAP = {
  nombre: 'name',
  apellido: 'name',
  localidad: 'localidad',
  telefono: 'phone',
  fecha_nacimiento: 'birthDate',
  bio: 'bio',
};

function ProfileHeader({
  user,
  onEditProfile,
  onToggleVisibility,
  onToggleEmail,
  onUploadAvatar,
  onDeleteAvatar,
  onUploadBanner,
  onDeleteBanner,
  isAdminView,
  onToggleAccountStatus,
  changingAccountStatus,
}) {
  const { initials, name, career, location, contactsCount, email, academicStatus, privacidad, foto_url, banner_url, email_visible } = user;
  const isPublic = privacidad === 'publico';
  const emailVisible = email_visible !== false;

  const [modalOpen, setModalOpen] = useState(false);
  const fotoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [formName, setFormName] = useState('');
  const [formLocalidad, setFormLocalidad] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formAutoPublish, setFormAutoPublish] = useState({
    enrollment: true,
    regular: true,
    approved: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showErrorBorders, setShowErrorBorders] = useState(false);
  const formRef = useRef(null);
  const errorBorderTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(errorBorderTimerRef.current);
  }, []);

  const toggleEmailVisibility = () => {
    onToggleEmail?.();
  };

  const openModal = () => {
    setFormName(name || '');
    setFormLocalidad(location || '');
    setFormPhone(user.phone || '');
    setFormBirthDate(user.birthDate || '');
    setFormBio(user.bio || '');
    setFormAutoPublish({
      enrollment: user.pub_inscripciones ?? true,
      regular: user.pub_regularizaciones ?? true,
      approved: user.pub_aprobaciones ?? true,
    });
    setFormErrors({});
    setSubmitError('');
    setShowErrorBorders(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!isSaving) setModalOpen(false);
  };

  const updateField = (field, value, setter) => {
    setter(value);
    if (!formErrors[field]) return;

    const nextValues = {
      name: formName,
      localidad: formLocalidad,
      phone: formPhone,
      birthDate: formBirthDate,
      bio: formBio,
      [field]: value,
    };
    const nextError = validateProfile(nextValues)[field];

    setFormErrors((current) => {
      if (nextError) return { ...current, [field]: nextError };
      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const showValidationErrors = (errors) => {
    setFormErrors(errors);
    setShowErrorBorders(true);
    clearTimeout(errorBorderTimerRef.current);
    errorBorderTimerRef.current = setTimeout(() => setShowErrorBorders(false), 2000);
    requestAnimationFrame(() => {
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const values = {
      name: formName,
      localidad: formLocalidad,
      phone: formPhone,
      birthDate: formBirthDate,
      bio: formBio,
    };
    const errors = validateProfile(values);

    setSubmitError('');
    if (Object.keys(errors).length > 0) {
      showValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      await onEditProfile?.({
        name: normalizeSpaces(formName),
        localidad: formLocalidad.trim() || null,
        phone: formPhone.trim() || null,
        birthDate: formBirthDate || null,
        bio: formBio.trim() || null,
        autoPublish: formAutoPublish,
      });
      setModalOpen(false);
    } catch (error) {
      const apiErrors = {};
      error.details?.forEach((detail) => {
        const field = API_FIELD_MAP[detail.field];
        if (field && !apiErrors[field]) apiErrors[field] = detail.message;
      });

      if (Object.keys(apiErrors).length > 0) {
        showValidationErrors(apiErrors);
      } else {
        setSubmitError(error.message || 'No pudimos guardar los cambios. Intentá nuevamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const ret = (n) => n ?? '';

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

  return (
    <section className={styles.card}>
      <div
        className={styles.gradientHeader}
        style={banner_url ? { backgroundImage: `url(${banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {onUploadBanner && (
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
        )}

        <div className={styles.avatarWrapper}>
          <Avatar initials={initials} src={foto_url || ''} size="xl" className={styles.avatar} />
          {onUploadAvatar && (
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
          )}
        </div>

        {onUploadBanner && (
          <>
            <input ref={fotoInputRef} type="file" accept="image/*" hidden onChange={handleFotoChange} />
            <input ref={bannerInputRef} type="file" accept="image/*" hidden onChange={handleBannerChange} />
          </>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.info}>
            <h1 className={styles.name}>{name}</h1>
            {career && career !== 'Carrera no definida' && (
              <p className={styles.career}>{career}</p>
            )}

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

          {isAdminView && onToggleAccountStatus && (
            <div className={styles.adminActions}>
              <button
                type="button"
                className={
                  user.activo
                    ? styles.suspendButton
                    : styles.reactivateButton
                }
                onClick={onToggleAccountStatus}
                disabled={changingAccountStatus}
              >
                {changingAccountStatus
                  ? 'Procesando...'
                  : user.activo
                    ? 'Suspender cuenta'
                    : 'Reactivar cuenta'}
              </button>
            </div>
          )}

          {(onToggleVisibility || onEditProfile) && (
            <div className={styles.actions}>
              {onToggleVisibility && (
                <button type="button" className={styles.btnPublico} onClick={() => onToggleVisibility?.()}>
                  {isPublic ? <Globe size={16} /> : <Lock size={16} />}
                  {isPublic ? 'Público' : 'Privado'}
                </button>
              )}
              {onEditProfile && (
                <button type="button" className={styles.btnEdit} onClick={openModal}>
                  <SquarePen className={styles.btnIcon} />
                  Editar perfil
                </button>
              )}
            </div>
          )}
        </div>

        <hr className={styles.divider} />

        <div className={styles.detailItem}>
          <Mail className={styles.detailIcon} />
          <div>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>
              {emailVisible ? email : 'Oculto'}
              {onToggleEmail && (
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={toggleEmailVisibility}
                  title={emailVisible ? 'Ocultar email' : 'Mostrar email'}
                >
                  {emailVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </span>
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

      {onEditProfile && (
        <Modal open={modalOpen} title="Editar perfil" onClose={closeModal} size="md"
          footer={
            <>
              <Button variant="ghost" onClick={closeModal} disabled={isSaving}>Cancelar</Button>
              <Button variant="primary" type="submit" form={PROFILE_FORM_ID} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </>
          }
        >
          <form id={PROFILE_FORM_ID} ref={formRef} className={styles.editForm} onSubmit={handleSubmit} noValidate>
            <div className={styles.editField}>
              <label className={styles.editLabel} htmlFor="edit-name">
                Nombre completo <span className={styles.required}>*</span>
              </label>
              <input
                id="edit-name"
                name="name"
                className={`${styles.editInput} ${formErrors.name && showErrorBorders ? styles.invalidPulse : ''}`}
                value={ret(formName)}
                maxLength={201}
                required
                aria-required="true"
                autoComplete="name"
                aria-invalid={Boolean(formErrors.name)}
                aria-describedby={formErrors.name ? 'edit-name-error' : undefined}
                onChange={(e) => updateField('name', e.target.value, setFormName)}
              />
              {formErrors.name && <span id="edit-name-error" className={styles.editError}>{formErrors.name}</span>}
            </div>

            <div className={styles.editField}>
              <label className={styles.editLabel} htmlFor="edit-location">Localidad</label>
              <input
                id="edit-location"
                name="localidad"
                className={`${styles.editInput} ${formErrors.localidad && showErrorBorders ? styles.invalidPulse : ''}`}
                value={ret(formLocalidad)}
                maxLength={120}
                autoComplete="address-level2"
                aria-invalid={Boolean(formErrors.localidad)}
                aria-describedby={formErrors.localidad ? 'edit-location-error' : undefined}
                onChange={(e) => updateField('localidad', e.target.value, setFormLocalidad)}
                placeholder="Ej: CABA"
              />
              {formErrors.localidad && <span id="edit-location-error" className={styles.editError}>{formErrors.localidad}</span>}
            </div>

            <div className={styles.editField}>
              <label className={styles.editLabel} htmlFor="edit-phone">Teléfono</label>
              <input
                id="edit-phone"
                name="phone"
                className={`${styles.editInput} ${formErrors.phone && showErrorBorders ? styles.invalidPulse : ''}`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={ret(formPhone)}
                maxLength={32}
                aria-invalid={Boolean(formErrors.phone)}
                aria-describedby={formErrors.phone ? 'edit-phone-error' : undefined}
                onChange={(e) => updateField('phone', e.target.value, setFormPhone)}
                placeholder="Ej: 11 1234-5678"
              />
              {formErrors.phone && <span id="edit-phone-error" className={styles.editError}>{formErrors.phone}</span>}
            </div>

            <div className={styles.editField}>
              <label className={styles.editLabel} htmlFor="edit-birth-date">Fecha de nacimiento</label>
              <input
                id="edit-birth-date"
                name="birthDate"
                className={`${styles.editInput} ${formErrors.birthDate && showErrorBorders ? styles.invalidPulse : ''}`}
                type="date"
                autoComplete="bday"
                max={getLatestBirthDate()}
                value={ret(formBirthDate)}
                aria-invalid={Boolean(formErrors.birthDate)}
                aria-describedby={formErrors.birthDate ? 'edit-birth-date-error' : undefined}
                onChange={(e) => updateField('birthDate', e.target.value, setFormBirthDate)}
              />
              {formErrors.birthDate && <span id="edit-birth-date-error" className={styles.editError}>{formErrors.birthDate}</span>}
            </div>

            <div className={styles.editField}>
              <span className={styles.editLabel}>Carrera</span>
              <div className={styles.editCareerTags}>
                {career && career !== 'Carrera no definida'
                  ? <span className={styles.editCareerTag}>{career}</span>
                  : <span className={styles.editHelp}>Carrera no definida</span>}
              </div>
              <span className={styles.editHelp}>La carrera se administra desde la situación académica.</span>
            </div>

            <div className={styles.editField}>
              <label className={styles.editLabel} htmlFor="edit-bio">Biografía</label>
              <textarea
                id="edit-bio"
                name="bio"
                className={`${styles.editTextarea} ${formErrors.bio && showErrorBorders ? styles.invalidPulse : ''}`}
                rows={3}
                maxLength={500}
                value={ret(formBio)}
                aria-invalid={Boolean(formErrors.bio)}
                aria-describedby={formErrors.bio ? 'edit-bio-error' : undefined}
                onChange={(e) => updateField('bio', e.target.value, setFormBio)}
                placeholder="Contá algo sobre vos..."
              />
              {formErrors.bio && <span id="edit-bio-error" className={styles.editError}>{formErrors.bio}</span>}
            </div>

            <label className={styles.editLabel}>Publicaciones automáticas</label>
            <p className={styles.editHelp}>Elegí qué eventos querés que se publiquen automáticamente en tu perfil:</p>
            <div className={styles.editCheckboxGroup}>
              {AUTO_PUBLISH_OPTIONS.map((opt) => (
                <label key={opt.key} className={styles.editCheckbox}>
                  <input
                    type="checkbox"
                    checked={formAutoPublish[opt.key] ?? true}
                    onChange={(e) => setFormAutoPublish({ ...formAutoPublish, [opt.key]: e.target.checked })}
                  />
                  <opt.Icon size={14} />
                  {opt.label}
                </label>
              ))}
            </div>

            {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}
          </form>
        </Modal>
      )}
    </section>
  );
}

export default ProfileHeader;
