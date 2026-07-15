import { useState } from 'react';
import Button from "@/components/common/Button";
import InputField from "@/components/common/InputField";
import styles from './StudySessions.module.css';

const INITIAL_FORM = {
  subject: '',
  topic: '',
  type: 'virtual',
  meetingLink: '',
  location: '',
  date: '',
  time: '',
  durationHours: '2',
  durationMinutes: '0',
  maxParticipants: '',
  description: '',
  privacy: 'public',
  requiresApproval: false,
};

function SessionForm({ onSubmit, onCancel, materias = [], initialValues = null }) {
  const isEdit = Boolean(initialValues);
  const [form, setForm] = useState(() =>
    initialValues ? { ...INITIAL_FORM, ...initialValues } : INITIAL_FORM
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Actualiza campos simples del formulario
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Si el usuario corrige un campo, limpiamos su error
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
    setSubmitError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.subject) {
      newErrors.subject = 'La materia es obligatoria.';
    }

    if (!form.topic.trim()) {
      newErrors.topic = 'El tema de la sesión es obligatorio.';
    }

    if (form.type === 'virtual' && !form.meetingLink.trim()) {
      newErrors.meetingLink = 'El link de la videollamada es obligatorio.';
    }

    if (form.type === 'presencial' && !form.location.trim()) {
      newErrors.location = 'La ubicación es obligatoria.';
    }

    if (!form.date) {
      newErrors.date = 'La fecha es obligatoria.';
    }

    if (!form.time) {
      newErrors.time = 'La hora es obligatoria.';
    }

    if (form.date && form.time) {
      const selectedDate = new Date(`${form.date}T${form.time}`);
      const now = new Date();

      if (selectedDate <= now) {
        newErrors.date = 'La fecha y hora deben ser futuras.';
      }
    }

    const hours = Number(form.durationHours);
    const minutes = Number(form.durationMinutes);

    if (Number.isNaN(hours) || hours < 0) {
      newErrors.durationHours = 'Las horas no pueden ser negativas.';
    }

    if (Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
      newErrors.durationMinutes = 'Los minutos deben estar entre 0 y 59.';
    }

    if (hours === 0 && minutes === 0) {
      newErrors.durationHours = 'La duración debe ser mayor a 0.';
    }

    if (form.maxParticipants) {
      const maxParticipants = Number(form.maxParticipants);

      if (
        Number.isNaN(maxParticipants) ||
        maxParticipants <= 0 ||
        !Number.isInteger(maxParticipants)
      ) {
        newErrors.maxParticipants = 'El cupo debe ser un número entero positivo.';
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      materia_id: Number(form.subject),
      tema: form.topic.trim(),
      tipo: form.type,
      link_ubicacion:
        form.type === 'virtual' ? form.meetingLink.trim() : form.location.trim(),
      fecha_hora: new Date(`${form.date}T${form.time}`).toISOString(),
      duracion_minutos: Number(form.durationHours) * 60 + Number(form.durationMinutes),
      cupos_max: form.maxParticipants ? Number(form.maxParticipants) : null,
      descripcion: form.description.trim(),
      requiere_aprobacion: form.requiresApproval,
      privacidad: form.privacy,
    };

    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit?.(payload);
    } catch (err) {
      setSubmitError(err.message || 'No pudimos guardar la sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.sessionForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Materia <span>*</span>
        </label>

        <select
          className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
          value={form.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
        >
          <option value="">Seleccionar materia</option>
          {materias.map((materia) => (
            <option key={materia.id} value={materia.id}>
              {materia.nombre}
            </option>
          ))}
        </select>

        {errors.subject && <p className={styles.error}>{errors.subject}</p>}
      </div>

      <InputField
        label="Tema"
        name="topic"
        value={form.topic}
        placeholder="Ej: Repaso para parcial"
        required
        error={errors.topic}
        onChange={(e) => handleChange('topic', e.target.value)}
      />

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Tipo <span>*</span>
        </label>

        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="type"
              value="virtual"
              checked={form.type === 'virtual'}
              onChange={(e) => handleChange('type', e.target.value)}
            />
            Virtual
          </label>

          <label className={styles.radioOption}>
            <input
              type="radio"
              name="type"
              value="presencial"
              checked={form.type === 'presencial'}
              onChange={(e) => handleChange('type', e.target.value)}
            />
            Presencial
          </label>
        </div>
      </div>

      {form.type === 'virtual' ? (
        <InputField
          label="Link de la videollamada"
          name="meetingLink"
          type="url"
          value={form.meetingLink}
          placeholder="https://meet.google.com/..."
          required
          error={errors.meetingLink}
          onChange={(e) => handleChange('meetingLink', e.target.value)}
        />
      ) : (
        <InputField
          label="Ubicación"
          name="location"
          value={form.location}
          placeholder="Ej: Aula 305, Biblioteca central"
          required
          error={errors.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      )}

      <div className={styles.formRow}>
        <InputField
          label="Fecha"
          name="date"
          type="date"
          value={form.date}
          required
          error={errors.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />

        <InputField
          label="Hora"
          name="time"
          type="time"
          value={form.time}
          required
          error={errors.time}
          onChange={(e) => handleChange('time', e.target.value)}
        />
      </div>

      <div className={styles.formRow}>
        <InputField
          label="Duración (horas)"
          name="durationHours"
          type="number"
          value={form.durationHours}
          error={errors.durationHours}
          onChange={(e) => handleChange('durationHours', e.target.value)}
        />

        <InputField
          label="Duración (minutos)"
          name="durationMinutes"
          type="number"
          value={form.durationMinutes}
          error={errors.durationMinutes}
          onChange={(e) => handleChange('durationMinutes', e.target.value)}
        />
      </div>

      <InputField
        label="Cupo máximo (opcional)"
        name="maxParticipants"
        type="number"
        value={form.maxParticipants}
        placeholder="Dejar vacío para sin límite"
        error={errors.maxParticipants}
        onChange={(e) => handleChange('maxParticipants', e.target.value)}
      />

      <div className={styles.formGroup}>
        <label className={styles.label}>Descripción</label>

        <textarea
          className={styles.textarea}
          value={form.description}
          placeholder="Agregá detalles adicionales sobre la sesión..."
          rows={4}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Privacidad</label>

        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="privacy"
              value="public"
              checked={form.privacy === 'public'}
              onChange={(e) => handleChange('privacy', e.target.value)}
            />
            Pública
          </label>

          <label className={styles.radioOption}>
            <input
              type="radio"
              name="privacy"
              value="private"
              checked={form.privacy === 'private'}
              onChange={(e) => handleChange('privacy', e.target.value)}
            />
            Privada
          </label>
        </div>

        <p className={styles.helpText}>
          Pública: visible para todos. Privada: visible solo para tus contactos.
        </p>
      </div>

      <label className={styles.checkboxOption}>
        <input
          type="checkbox"
          checked={form.requiresApproval}
          onChange={(e) => handleChange('requiresApproval', e.target.checked)}
        />
        <span>
          Requiere aprobación para que otros estudiantes puedan sumarse.
        </span>
      </label>

      {submitError && <p className={styles.error}>{submitError}</p>}

      <div className={styles.formActions}>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>

        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting
            ? 'Guardando...'
            : isEdit
              ? 'Guardar cambios'
              : 'Crear sesión'}
        </Button>
      </div>
    </form>
  );
}

export default SessionForm;
