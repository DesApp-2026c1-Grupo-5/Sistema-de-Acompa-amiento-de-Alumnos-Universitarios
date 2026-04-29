import { useMemo, useState } from 'react';
import { Flag } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { REPORT_REASONS } from '../../pages/student/materials/mockData';
import styles from './ReportModal.module.css';

const INITIAL = { reason: '', detail: '' };

function ReportModal({ material, onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(() => {
    if (!form.reason) return false;
    if (form.reason === 'other' && form.detail.trim().length < 5) return false;
    return true;
  }, [form]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!isValid) return;
    setSubmitting(true);
    const payload = {
      materialId: material?.id,
      reason: form.reason,
      detail: form.detail.trim(),
      reportedAt: new Date().toISOString(),
    };
    onSubmit?.(payload);
    setSubmitting(false);
    onClose?.();
  };

  return (
    <Modal
      open
      title="Denunciar material"
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="dangerSolid"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            iconLeft={<Flag size={16} />}
          >
            Enviar denuncia
          </Button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {material && (
          <p className={styles.target}>
            Estás denunciando: <strong>{material.title}</strong>
          </p>
        )}

        <div className={styles.field}>
          <span className={styles.label}>
            Motivo <span className={styles.required}>*</span>
          </span>
          <ul className={styles.reasons} role="radiogroup">
            {REPORT_REASONS.map((r) => {
              const selected = form.reason === r.value;
              return (
                <li key={r.value}>
                  <label
                    className={`${styles.reasonItem} ${selected ? styles.reasonItemSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r.value}
                      checked={selected}
                      onChange={() =>
                        setForm((p) => ({ ...p, reason: r.value }))
                      }
                      className={styles.radio}
                    />
                    <span className={styles.reasonLabel}>{r.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>
            Detalle{' '}
            {form.reason === 'other' && (
              <span className={styles.required}>*</span>
            )}
          </span>
          <textarea
            className={styles.textarea}
            placeholder="Contanos más detalles para revisar la denuncia..."
            rows={4}
            value={form.detail}
            onChange={(e) =>
              setForm((p) => ({ ...p, detail: e.target.value }))
            }
            maxLength={500}
          />
          <span className={styles.counter}>{form.detail.length}/500</span>
        </label>
      </form>
    </Modal>
  );
}

export default ReportModal;
