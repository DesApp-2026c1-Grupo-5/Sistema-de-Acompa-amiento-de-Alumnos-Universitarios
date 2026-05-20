import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import styles from './ModalConfirmation.module.css';

function ModalConfirmation({
  open,
  title = 'Confirmar acción',
  message = '¿Está seguro de realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger'
}) {
  const footer = (
    <div className={styles.footer}>
      <Button variant="outline" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button
        variant={variant === 'danger' ? 'dangerSolid' : 'primary'}
        onClick={onConfirm}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      footer={footer}
    >
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={24} />
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </Modal>
  );
}

export default ModalConfirmation;