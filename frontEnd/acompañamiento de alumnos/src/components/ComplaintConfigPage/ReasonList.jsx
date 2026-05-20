import { useState } from 'react';
import { Plus } from 'lucide-react';

import ReasonItem from './ReasonItem';

import styles from '../../pages/admin/ComplaintConfigPage/ComplaintConfigPage.module.css';

function ReasonList({
  reasons,
  setConfig,
}) {
  const [newReason, setNewReason] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAddReason = () => {
    if (!newReason.trim()) return;

    const newItem = {
      id: Date.now(),
      texto: newReason,
      activo: true,
    };

    setConfig((prevConfig) => ({
      ...prevConfig,
      motivos: [...prevConfig.motivos, newItem],
    }));

    setNewReason('');
    setShowInput(false);
  };

  const handleDelete = (id) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      motivos: prevConfig.motivos.filter(
        (reason) => reason.id !== id
      ),
    }));
  };

  const handleEdit = (id) => {
    const nuevoTexto = prompt('Editar motivo');

    if (!nuevoTexto) return;

    setConfig((prevConfig) => ({
      ...prevConfig,
      motivos: prevConfig.motivos.map((reason) =>
        reason.id === id
          ? { ...reason, texto: nuevoTexto }
          : reason
      ),
    }));
  };

  return (
    <section className={styles.reasonCard}>
      <div className={styles.reasonHeader}>
        <h2>Motivos de denuncia</h2>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowInput(true)}
        >
          <Plus size={18} />
          Agregar motivo
        </button>
      </div>

      {showInput && (
        <div className={styles.newReasonBox}>
          <input
            type="text"
            placeholder="Nuevo motivo de denuncia..."
            value={newReason}
            onChange={(event) =>
              setNewReason(event.target.value)
            }
          />

          <div className={styles.newReasonActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleAddReason}
            >
              Guardar
            </button>

            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setShowInput(false);
                setNewReason('');
              }}
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
    </section>
  );
}

export default ReasonList;