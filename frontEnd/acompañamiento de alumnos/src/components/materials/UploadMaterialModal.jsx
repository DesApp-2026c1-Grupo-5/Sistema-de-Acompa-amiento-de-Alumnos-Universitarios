import { useMemo, useRef, useState } from 'react';
import {
  FileText,
  Link as LinkIcon,
  Video,
  HardDrive,
  GitBranch,
  MessageSquare,
  Upload,
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  SUBJECTS,
  TYPE_OPTIONS,
} from '../../pages/student/materials/mockData';
import {
  buildNewMaterial,
  validateFile,
  validateUrl,
} from '../../pages/student/materials/helpers';
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

function UploadMaterialModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type, file: null, url: '' }));
    setErrors((prev) => ({ ...prev, file: '', url: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setField('file', file);
    if (file) {
      const err = validateFile(file);
      if (err) setErrors((prev) => ({ ...prev, file: err }));
    }
  };

  const isValid = useMemo(() => {
    if (!form.title.trim() || !form.subject.trim() || !form.type) return false;
    if (form.type === 'file') {
      return !!form.file && !validateFile(form.file);
    }
    return !!form.url.trim() && !validateUrl(form.url);
  }, [form]);

  const validateAll = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'El título es obligatorio.';
    if (!form.subject.trim()) next.subject = 'Seleccioná una materia.';
    if (!form.type) next.type = 'Seleccioná un tipo.';
    if (form.type === 'file') {
      const e = validateFile(form.file);
      if (e) next.file = e;
    } else {
      const e = validateUrl(form.url);
      if (e) next.url = e;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    const material = buildNewMaterial({
      title: form.title,
      subject: form.subject,
      type: form.type,
      description: form.description,
      tags: form.tags,
      url: form.url,
      file: form.file,
    });
    onSubmit?.(material);
    onClose?.();
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
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Publicar material
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
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
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
              <span className={styles.hint}>
                {' '}
                (máx. {MAX_FILE_SIZE_MB} MB —{' '}
                {ALLOWED_EXTENSIONS.map((e) => e.toUpperCase()).join(', ')})
              </span>
            </span>
            <button
              type="button"
              className={`${styles.fileBox} ${errors.file ? styles.inputError : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} className={styles.fileIcon} />
              <span className={styles.fileText}>
                {form.file ? form.file.name : 'Seleccionar archivo'}
              </span>
              {!form.file && (
                <span className={styles.fileHint}>Sin archivos seleccionados</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')}
              onChange={handleFileChange}
              className={styles.fileInput}
              aria-hidden="true"
              tabIndex={-1}
            />
            {errors.file && (
              <span className={styles.errorText}>{errors.file}</span>
            )}
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
            maxLength={400}
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
      </form>
    </Modal>
  );
}

export default UploadMaterialModal;
