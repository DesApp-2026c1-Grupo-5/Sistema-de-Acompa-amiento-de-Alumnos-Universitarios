import { useRef, useState } from 'react';
import { Video, MapPin, CalendarDays, Clock, Users, Paperclip, Upload, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import styles from '../../pages/student/StudySessions.module.css';

function formatDate(date) {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function formatDuration(session) {
  if (session.durationMinutes === 0) return `${session.durationHours}h`;
  return `${session.durationHours}h ${session.durationMinutes}m`;
}

function getStatusInfo(session) {
  if (session.cancelled) return { text: 'Cancelada', className: styles.statusFull };
  if (session.date && session.time) {
    const start = new Date(`${session.date}T${session.time}:00`).getTime();
    const totalMinutes = (session.durationHours || 0) * 60 + (session.durationMinutes || 0);
    if (Date.now() >= start + totalMinutes * 60 * 1000) {
      return { text: 'Finalizada', className: styles.statusEnded };
    }
  }
  if (session.maxParticipants && session.participantsCount >= session.maxParticipants) {
    return { text: 'Completa', className: styles.statusFull };
  }
  if (session.userStatus === 'pending') {
    return { text: 'Pendiente', className: styles.statusPending };
  }
  return { text: 'Disponible', className: styles.statusAvailable };
}

function formatSize(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SessionDetailModal({
  session,
  open,
  onClose,
  onApprove,
  onReject,
  onUploadFiles,
  onDeleteFile,
  actionError,
}) {
  const status = session ? getStatusInfo(session) : null;
  const canManagePending =
    session?.userStatus === 'created' &&
    session?.pendingRequests?.length > 0 &&
    onApprove &&
    onReject;
  const canUploadFiles = session?.userStatus === 'created' && onUploadFiles;
  const canDeleteFiles = session?.userStatus === 'created' && onDeleteFile;

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const handleSelectFiles = (event) => {
    setSelectedFiles(Array.from(event.target.files ?? []));
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setUploadError('Seleccioná al menos un archivo.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      await onUploadFiles?.(selectedFiles);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err.message || 'No pudimos subir los archivos.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (archivo) => {
    if (!window.confirm(`¿Borrar ${archivo.nombreOriginal}?`)) return;

    setDeletingFileId(archivo.id);
    setDeleteError('');

    try {
      await onDeleteFile?.(archivo.id);
    } catch (err) {
      setDeleteError(err.message || 'No pudimos borrar el archivo.');
    } finally {
      setDeletingFileId(null);
    }
  };

  return (
    <Modal open={open} title="Detalle de sesión" onClose={onClose} size="md">
      {session && (
        <div className={styles.detailBox}>
          <header className={styles.detailHeader}>
            <h3>
              {session.subject}
              <span className={`${styles.statusBadge} ${status.className}`}>
                {status.text}
              </span>
            </h3>
            <p className={styles.detailTopic}>{session.topic}</p>
          </header>

          <div className={styles.detailInfoCard}>
            <div className={styles.detailRow}>
              {session.type === 'virtual' ? <Video size={18} /> : <MapPin size={18} />}
              <div className={styles.detailRowText}>
                <span className={styles.detailLabel}>Tipo</span>
                <span className={styles.detailValue}>
                  {session.type === 'virtual' ? 'Virtual' : 'Presencial'}
                </span>
                {session.linkUbicacion && (
                  session.type === 'virtual' ? (
                    <a
                      href={session.linkUbicacion}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.detailLink}
                    >
                      {session.linkUbicacion}
                    </a>
                  ) : (
                    <span className={styles.detailLocation}>{session.linkUbicacion}</span>
                  )
                )}
              </div>
            </div>

            <div className={styles.detailRow}>
              <CalendarDays size={18} />
              <div className={styles.detailRowText}>
                <span className={styles.detailLabel}>Fecha y hora</span>
                <span className={styles.detailValue}>
                  {formatDate(session.date)} · {session.time}
                </span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <Clock size={18} />
              <div className={styles.detailRowText}>
                <span className={styles.detailLabel}>Duración</span>
                <span className={styles.detailValue}>{formatDuration(session)}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <Users size={18} />
              <div className={styles.detailRowText}>
                <span className={styles.detailLabel}>Participantes</span>
                <span className={styles.detailValue}>
                  {session.participantsCount}/{session.maxParticipants ?? '∞'}
                </span>
              </div>
            </div>
          </div>

          {session.description && (
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Descripción</h4>
              <p className={styles.detailDescription}>{session.description}</p>
            </div>
          )}

          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>Creador</h4>
            <div className={styles.participantRow}>
              <div className={styles.participantAvatar}>{session.creatorInitials}</div>
              <span className={styles.participantName}>{session.creatorName}</span>
            </div>
          </div>

          {session.participants?.length > 0 && (
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Participantes</h4>
              {session.participants.map((p) => (
                <div key={p.inscripcionId} className={styles.participantRow}>
                  <div className={styles.participantAvatar}>{p.initials}</div>
                  <span className={styles.participantName}>{p.name}</span>
                  <span className={styles.confirmedBadge}>Confirmado</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>Archivos adjuntos</h4>

            {session.archivos?.length > 0 ? (
              <div className={styles.fileList}>
                {session.archivos.map((archivo) => (
                  <article key={archivo.id} className={styles.fileRow}>
                    <Paperclip size={16} />
                    <div className={styles.fileRowText}>
                      <a href={archivo.url} target="_blank" rel="noreferrer" className={styles.fileLink}>
                        {archivo.nombreOriginal}
                      </a>
                      <div className={styles.fileMetaRow}>
                        <span className={styles.fileMeta}>
                          {archivo.uploader ? `${archivo.uploader.nombre} ${archivo.uploader.apellido}` : 'Archivo'}
                          {archivo.sizeBytes != null ? ` · ${formatSize(archivo.sizeBytes)}` : ''}
                        </span>

                        {canDeleteFiles && (
                          <button
                            type="button"
                            className={styles.fileDeleteButton}
                            onClick={() => handleDelete(archivo)}
                            disabled={deletingFileId === archivo.id}
                            aria-label={`Borrar ${archivo.nombreOriginal}`}
                          >
                            <Trash2 size={16} className={styles.fileDeleteIcon} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyFiles}>Todavía no hay archivos subidos.</p>
            )}

            {canUploadFiles && (
              <div className={styles.uploadBox}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className={styles.uploadInput}
                  onChange={handleSelectFiles}
                />

                <div className={styles.uploadActions}>
                  <span className={styles.uploadHint}>
                    Podés subir PDFs, imágenes o cualquier archivo útil para la sesión.
                  </span>

                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    <Upload size={16} />
                    {uploading ? 'Subiendo...' : 'Subir archivos'}
                  </button>
                </div>

                {selectedFiles.length > 0 && (
                  <p className={styles.uploadSelected}>
                    Seleccionados: {selectedFiles.map((file) => file.name).join(', ')}
                  </p>
                )}

                {uploadError && <p className={styles.actionError}>{uploadError}</p>}
                {deleteError && <p className={styles.actionError}>{deleteError}</p>}
              </div>
            )}
          </div>

          {canManagePending && (
            <div className={styles.pendingBox}>
              <h4>Solicitudes pendientes</h4>
              {session.pendingRequests.map((req) => (
                <div key={req.inscripcionId} className={styles.pendingItem}>
                  <span>{req.name}</span>
                  <div className={styles.pendingActions}>
                    <button
                      type="button"
                      className={styles.approveBtn}
                      onClick={() => onApprove(req.inscripcionId)}
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      className={styles.rejectBtn}
                      onClick={() => onReject(req.inscripcionId)}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {actionError && <p className={styles.actionError}>{actionError}</p>}
        </div>
      )}
    </Modal>
  );
}

export default SessionDetailModal;
