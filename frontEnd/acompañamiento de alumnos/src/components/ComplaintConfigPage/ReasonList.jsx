import { useState } from 'react';
import { Plus } from 'lucide-react';

import ReasonItem from './ReasonItem';
import ModalConfirmation from '../common/ModalConfirmation';

import styles from '../../pages/admin/ComplaintConfigPage/ComplaintConfigPage.module.css';

function ReasonList({ reasons, onCreate, onEdit, onDelete, actionError }) {
  const [newReason, setNewReason] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reasonToDelete, setReasonToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleAddReason = async () => {
    const value = newReason.trim();
    if (!value) return;

    setSubmitting(true);
    try {
      await onCreate(value);
      setNewReason('');
      setShowInput(false);
    } catch {
      // El error queda visible via actionError del padre
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id, currentText) => {
    const nuevoTexto = window.prompt('Editar motivo', currentText ?? '');
    if (!nuevoTexto || !nuevoTexto.trim()) return;

    try {
      await onEdit(id, nuevoTexto.trim());
    } catch {
      // Error mostrado por el padre
    }
  };

  const handleDelete = (id, texto) => {
    setReasonToDelete({ id, texto });
  };

  const confirmDelete = async () => {
    if (!reasonToDelete) return;
    setDeleting(true);
    try {
      await onDelete(reasonToDelete.id);
      setReasonToDelete(null);
    } catch {
      // Error mostrado por el padre, el modal queda abierto para reintentar/cancelar
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (deleting) return;
    setReasonToDelete(null);
  };

  return (
    <section className={styles.reasonCard}>
      <div className={styles.reasonHeader}>
        <h2>Motivos de denuncia</h2>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowInput(true)}
          disabled={submitting}
        >
          <Plus size={18} />
          Agregar motivo
        </button>
      </div>

      {actionError && (
        <p className={styles.actionError}>{actionError}</p>
      )}

      {showInput && (
        <div className={styles.newReasonBox}>
          <input
            type="text"
            placeholder="Nuevo motivo de denuncia..."
            value={newReason}
            onChange={(event) => setNewReason(event.target.value)}
            disabled={submitting}
          />

          <div className={styles.newReasonActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleAddReason}
              disabled={submitting}
            >
              {submitting ? 'Guardando…' : 'Guardar'}
            </button>

            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setShowInput(false);
                setNewReason('');
              }}
              disabled={submitting}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className={styles.reasonList}>
        {reasons.map((reason) => (
          <ReasonItem
            key={reason.id}
            reason={reason}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <ModalConfirmation
        open={Boolean(reasonToDelete)}
        title="Eliminar motivo de denuncia"
        message={
          reasonToDelete
            ? `¿Seguro que querés eliminar el motivo "${reasonToDelete.texto}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText={deleting ? 'Eliminando…' : 'Eliminar'}
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </section>
  );
}

export default ReasonList;
