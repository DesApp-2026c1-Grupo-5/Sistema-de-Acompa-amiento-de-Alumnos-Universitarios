import { MapPin, Users, Globe, SquarePen, Mail, Lock, Camera, Trash2, Phone, Cake, X, Plus, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Avatar from '../common/Avatar';
import styles from './ProfileHeader.module.css';

const CAREER_OPTIONS = [
  'Carrera no definida',
  'Ingeniería en Sistemas',
  'Licenciatura en Administración',
  'Medicina',
  'Derecho',
  'Arquitectura',
  'Contador Público',
  'Licenciatura en Economía',
  'Ingeniería Industrial',
  'Licenciatura en Psicología',
];

const AUTO_PUBLISH_OPTIONS = [
  { key: 'enrollment', label: 'Inscripción', Icon: BookOpen },
  { key: 'regular', label: 'Regularización', Icon: TrendingUp },
  { key: 'approved', label: 'Aprobación', Icon: CheckCircle2 },
];

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

  const [formName, setFormName] = useState('');
  const [formLocalidad, setFormLocalidad] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formCareers, setFormCareers] = useState([]);
  const [formNewCareer, setFormNewCareer] = useState('');
  const [showCareerSuggestions, setShowCareerSuggestions] = useState(false);

  const filteredCareerOptions = formNewCareer.trim()
    ? CAREER_OPTIONS.filter(
        (opt) =>
          opt.toLowerCase().includes(formNewCareer.toLowerCase()) &&
          !formCareers.includes(opt)
      )
    : CAREER_OPTIONS.filter((opt) => !formCareers.includes(opt));
  const [formAutoPublish, setFormAutoPublish] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('autoPublishPrefs') || '{"enrollment":true,"regular":true,"approved":true}');
    } catch { return { enrollment: true, regular: true, approved: true }; }
  });

  useEffect(() => {
    localStorage.setItem('autoPublishPrefs', JSON.stringify(formAutoPublish));
  }, [formAutoPublish]);

  const openModal = () => {
    setFormName(name || '');
    setFormLocalidad(location || '');
    setFormPhone(() => { try { return JSON.parse(localStorage.getItem('profileExtraData') || '{}').phone || ''; } catch { return ''; } });
    setFormBirthDate(() => { try { return JSON.parse(localStorage.getItem('profileExtraData') || '{}').birthDate || ''; } catch { return ''; } });
    setFormBio(user.bio || '');
    setFormCareers(() => {
      const stored = localStorage.getItem('profileCareers');
      return stored ? JSON.parse(stored) : (career ? [career] : []);
    });
    setFormNewCareer('');
    setModalOpen(true);
  };

  const addCareer = () => {
    const c = formNewCareer.trim();
    if (c && !formCareers.includes(c)) {
      setFormCareers([...formCareers, c]);
      setFormNewCareer('');
    }
  };

  const removeCareer = (idx) => {
    setFormCareers(formCareers.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const careers = formCareers.length > 0 ? formCareers : (career ? [career] : []);
    localStorage.setItem('profileCareers', JSON.stringify(careers));
    localStorage.setItem('profileExtraData', JSON.stringify({ phone: formPhone, birthDate: formBirthDate }));

    onEditProfile?.({
      name: formName,
      localidad: formLocalidad,
      phone: formPhone,
      birthDate: formBirthDate,
      bio: formBio,
      careers,
      autoPublish: formAutoPublish,
    });
    setModalOpen(false);
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

      {onEditProfile && (
        <Modal open={modalOpen} title="Editar perfil" onClose={() => setModalOpen(false)} size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSubmit}>Guardar cambios</Button>
            </>
          }
        >
          <div className={styles.editForm}>
            <InputField label="Nombre completo" name="editName" value={ret(formName)} required
              onChange={(e) => setFormName(e.target.value)} />

            <label className={styles.editLabel}>Localidad</label>
            <input className={styles.editInput} value={ret(formLocalidad)}
              onChange={(e) => setFormLocalidad(e.target.value)} placeholder="Ej: CABA" />

            <label className={styles.editLabel}>Teléfono</label>
            <input className={styles.editInput} type="tel" value={ret(formPhone)}
              onChange={(e) => setFormPhone(e.target.value)} placeholder="Ej: 11 1234-5678" />

            <label className={styles.editLabel}>Fecha de nacimiento</label>
            <input className={styles.editInput} type="date" value={ret(formBirthDate)}
              onChange={(e) => setFormBirthDate(e.target.value)} />

            <label className={styles.editLabel}>Carreras</label>
            <div className={styles.editCareerRow}>
              <div className={styles.autocompleteWrapper}>
                <input className={styles.editInput} value={formNewCareer}
                  onChange={(e) => { setFormNewCareer(e.target.value); setShowCareerSuggestions(true); }}
                  onFocus={() => setShowCareerSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCareerSuggestions(false), 200)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCareer(); } }}
                  placeholder="Agregar carrera..." />
                {showCareerSuggestions && filteredCareerOptions.length > 0 && (
                  <div className={styles.autocompleteList}>
                    {filteredCareerOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        className={styles.autocompleteOption}
                        onMouseDown={(e) => { e.preventDefault(); setFormNewCareer(opt); setShowCareerSuggestions(false); }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className={styles.editCareerAddBtn} onClick={addCareer}>
                <Plus size={16} />
              </button>
            </div>
            <div className={styles.editCareerTags}>
              {formCareers.map((c, i) => (
                <span key={i} className={styles.editCareerTag}>
                  {c}
                  <button type="button" className={styles.editCareerRemove} onClick={() => removeCareer(i)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <label className={styles.editLabel}>Biografía</label>
            <textarea className={styles.editTextarea} rows={3} value={ret(formBio)}
              onChange={(e) => setFormBio(e.target.value)} placeholder="Contá algo sobre vos..." />

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
          </div>
        </Modal>
      )}
    </section>
  );
}

export default ProfileHeader;