import { useMemo, useState } from 'react';
import {
  FileText,
  Link as LinkIcon,
  Video,
  HardDrive,
  GitBranch,
  MessageSquare,
  Upload,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import {
  ALLOWED_EXTENSIONS,
  FILE_ACCEPT,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  TYPE_OPTIONS,
} from '../../pages/student/materials/materialConstants';
import { parseTags, validateUrl } from '../../pages/student/materials/helpers';
import styles from './UploadMaterialModal.module.css';

const TYPE_ICONS = {
  file: FileText,
  link: LinkIcon,
  video: Video,
  drive: HardDrive,
  github: GitBranch,
  discord: MessageSquare,
};

const URL_PLACEHOLDERS = {
  link: 'https://ejemplo.com/recurso',
  video: 'https://youtube.com/watch?v=...',
  drive: 'https://drive.google.com/drive/folders/...',
  github: 'https://github.com/usuario/repositorio',
  discord: 'https://discord.gg/invite',
};

const INITIAL_FORM = {
  title: '',
  subject: '',
  type: 'file',
  description: '',
  tags: '',
  url: '',
  file: null,
};

const getFileExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase() ?? '';

const validateFile = (file) => {
  if (!file) return 'Seleccioná un archivo.';
  if (file.size === 0) return 'El archivo está vacío.';
  if (!ALLOWED_EXTENSIONS.includes(getFileExtension(file.name))) {
    return `Formato no permitido. Usá: ${ALLOWED_EXTENSIONS.join(', ')}.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `El archivo no puede superar los ${MAX_FILE_SIZE_MB} MB.`;
  }
  return '';
};

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024))} MB`;
};

function UploadMaterialModal({ onClose, onSubmit, materias = [] }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
    setSubmitError('');
  };

  const handleTypeChange = (type) => {
    if (type === form.type) return;
    setForm((prev) => ({ ...prev, type, url: '', file: null }));
    setErrors((prev) => ({ ...prev, url: '', file: '' }));
    setSubmitError('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, file }));
    setErrors((prev) => ({ ...prev, file: validateFile(file) }));
    setSubmitError('');
  };

  const isValid = useMemo(() => {
    if (!form.title.trim() || !form.subject || !form.type) return false;
    if (form.type === 'file') return !validateFile(form.file);
    return !!form.url.trim() && !validateUrl(form.url);
  }, [form]);

  const validateAll = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'El título es obligatorio.';
    if (!form.subject) next.subject = 'Seleccioná una materia.';
    if (!form.type) next.type = 'Seleccioná un tipo.';
    if (form.type === 'file') {
      const fileError = validateFile(form.file);
      if (fileError) next.file = fileError;
    } else {
      const urlError = validateUrl(form.url);
      if (urlError) next.url = urlError;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const payload = {
      materia_id: Number(form.subject),
      tipo: form.type,
      titulo: form.title.trim(),
      descripcion: form.description.trim(),
      tags: parseTags(form.tags),
      ...(form.type === 'file'
        ? { archivo: form.file }
        : { url_o_path: form.url.trim() }),
    };

    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit?.(payload);
      onClose?.();
    } catch (err) {
      setSubmitError(err.message || 'No pudimos publicar el material.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title="Subir material"
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={isValid ? 'primary' : 'primarySoft'}
            disabled={!isValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Publicando...' : 'Publicar material'}
          </Button>
        </>
      }
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
      >
        <label className={styles.field}>
          <span className={styles.label}>
            Título <span className={styles.required}>*</span>
          </span>
          <input
            type="text"
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            placeholder="Ej: Guía completa de Árboles Binarios"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            maxLength={120}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Materia <span className={styles.required}>*</span>
          </span>
          <select
            className={`${styles.input} ${styles.select} ${errors.subject ? styles.inputError : ''}`}
            value={form.subject}
            onChange={(e) => setField('subject', e.target.value)}
          >
            <option value="">Seleccionar materia</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          {errors.subject && (
            <span className={styles.errorText}>{errors.subject}</span>
          )}
        </label>

        <div className={styles.field}>
          <span className={styles.label}>
            Tipo de material <span className={styles.required}>*</span>
          </span>
          <div className={styles.typeGrid}>
            {TYPE_OPTIONS.map((opt) => {
              const Icon = TYPE_ICONS[opt.value];
              const selected = form.type === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={`${styles.typeBtn} ${selected ? styles.typeBtnActive : ''}`}
                  onClick={() => handleTypeChange(opt.value)}
                >
                  <Icon size={18} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {form.type === 'file' ? (
          <div className={styles.field}>
            <span className={styles.label}>
              Archivo <span className={styles.required}>*</span>
            </span>
            <label
              className={`${styles.fileBox} ${errors.file ? styles.inputError : ''}`}
            >
              <Upload size={20} className={styles.fileIcon} aria-hidden="true" />
              <span className={styles.fileContent}>
                <span className={styles.fileText}>
                  {form.file?.name || 'Seleccionar archivo'}
                </span>
                <span className={styles.fileHint}>
                  {form.file
                    ? `${getFileExtension(form.file.name).toUpperCase()} · ${formatFileSize(form.file.size)}`
                    : `${ALLOWED_EXTENSIONS.join(', ')} · Máximo ${MAX_FILE_SIZE_MB} MB`}
                </span>
              </span>
              <input
                key={form.type}
                type="file"
                className={styles.fileInput}
                accept={FILE_ACCEPT}
                onChange={handleFileChange}
              />
            </label>
            {errors.file && <span className={styles.errorText}>{errors.file}</span>}
          </div>
        ) : (
          <label className={styles.field}>
            <span className={styles.label}>
              URL <span className={styles.required}>*</span>
            </span>
            <input
              type="url"
              className={`${styles.input} ${errors.url ? styles.inputError : ''}`}
              placeholder={URL_PLACEHOLDERS[form.type] || 'https://...'}
              value={form.url}
              onChange={(e) => setField('url', e.target.value)}
            />
            {errors.url && <span className={styles.errorText}>{errors.url}</span>}
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.label}>Descripción</span>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            placeholder="Describe de qué trata el material..."
            rows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            maxLength={255}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Tags (separados por comas)</span>
          <input
            type="text"
            className={styles.input}
            placeholder="Ej: árboles, estructuras, teoría"
            value={form.tags}
            onChange={(e) => setField('tags', e.target.value)}
          />
        </label>

        {submitError && <span className={styles.errorText}>{submitError}</span>}
      </form>
    </Modal>
  );
}

export default UploadMaterialModal;
