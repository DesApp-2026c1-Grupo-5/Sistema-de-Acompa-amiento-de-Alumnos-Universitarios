import { useState, useCallback, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import styles from './FormModal.module.css';

function FormModal({ open, title, onClose, onSubmit, fields = [], initialValues = {} }) {
  const getInitialForm = useCallback(() => {
    const values = {};
    fields.forEach((f) => {
      values[f.name] = initialValues[f.name] ?? '';
    });
    return values;
  }, [fields, initialValues]);

  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setForm(getInitialForm());
        setErrors({});
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, getInitialForm]);

  const handleChange = (name, e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    fields.forEach((f) => {
      if (f.required && !form[f.name]?.trim()) {
        newErrors[f.name] = `${f.label} es obligatorio`;
      }
      if (f.type === 'email' && form[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form[f.name])) {
        newErrors[f.name] = 'Email inválido';
      }
      if (f.type === 'url' && form[f.name] && !/^https?:\/\/.+/.test(form[f.name])) {
        newErrors[f.name] = 'Link inválido';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit?.({ ...form });
      onClose?.();
    } catch {
      // si el submit falla, el modal queda abierto para reintentar
    }
  };

  const renderField = (field) => {
    const commonProps = {
      className: styles.input,
      value: form[field.name] || '',
      onChange: (e) => handleChange(field.name, e),
      placeholder: field.placeholder,
      disabled: field.readOnly,
    };

    if (field.type === 'textarea') {
      return (
        <label className={styles.field} key={field.name}>
          <span className={styles.label}>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </span>
          <textarea {...commonProps} rows={field.rows || 4} />
          {errors[field.name] && <span className={styles.error}>{errors[field.name]}</span>}
        </label>
      );
    }

    if (field.type === 'select') {
      return (
        <label className={styles.field} key={field.name}>
          <span className={styles.label}>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </span>
          <select {...commonProps} className={`${styles.input} ${styles.select}`}>
            <option value="">Seleccionar</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors[field.name] && <span className={styles.error}>{errors[field.name]}</span>}
        </label>
      );
    }

    return (
      <label className={styles.field} key={field.name}>
        <span className={styles.label}>
          {field.label}
          {field.required && <span className={styles.required}>*</span>}
        </span>
        <input {...commonProps} type={field.type || 'text'} />
        {errors[field.name] && <span className={styles.error}>{errors[field.name]}</span>}
      </label>
    );
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Enviar
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {fields.map(renderField)}
      </form>
    </Modal>
  );
}

export default FormModal;