import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Video,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Edit,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";

import Modal from "../../components/common/Modal";
import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import ModalConfirmation from "../../components/common/ModalConfirmation";
import Pagination from "../../components/common/Pagination";
import SessionDetailModal from "../../components/sessions/SessionDetailModal";
import SessionForm from "./SessionForm";
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  cancelSession,
  joinSession,
  approveParticipant,
  rejectParticipant,
  uploadSessionFiles,
  deleteSessionFile,
} from "../../services/sessionService";
import { getMaterias } from "../../services/materialService";
import { mapSessionFromApi } from "./sessions/mapSession";
import styles from "./StudySessions.module.css";

const PAGE_SIZE = 12;

function StudySessions() {
  const [mine, setMine] = useState([]);
  const [available, setAvailable] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [detailSession, setDetailSession] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [activeMyTab, setActiveMyTab] = useState("created");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const reloadMine = async () => {
    const res = await getSessions({ vista: "mias", limit: 50 });
    setMine((res?.data ?? []).map(mapSessionFromApi));
  };

  useEffect(() => {
    Promise.all([getSessions({ vista: "mias", limit: 50 }), getMaterias()])
      .then(([sesRes, matRes]) => {
        setMine((sesRes?.data ?? []).map(mapSessionFromApi));
        setMaterias(matRes?.data ?? []);
      })
      .catch((err) => {
        setError(err.message || "No pudimos cargar las sesiones.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    const fetchAvailable = async () => {
      setAvailableLoading(true);
      try {
        const res = await getSessions({
          vista: "disponibles",
          page,
          limit: PAGE_SIZE,
          q: debouncedSearch,
          materia_id: subjectFilter,
          tipo: typeFilter,
        });
        if (!active) return;
        setAvailable((res?.data ?? []).map(mapSessionFromApi));
        setTotalPages(res?.pagination?.totalPages ?? 1);
      } catch (err) {
        if (active) setError(err.message || "No pudimos cargar las sesiones.");
      } finally {
        if (active) setAvailableLoading(false);
      }
    };
    fetchAvailable();
    return () => {
      active = false;
    };
  }, [page, debouncedSearch, subjectFilter, typeFilter]);

  const reloadAvailable = async () => {
    const res = await getSessions({
      vista: "disponibles",
      page,
      limit: PAGE_SIZE,
      q: debouncedSearch,
      materia_id: subjectFilter,
      tipo: typeFilter,
    });
    setAvailable((res?.data ?? []).map(mapSessionFromApi));
    setTotalPages(res?.pagination?.totalPages ?? 1);
  };

  const reloadSessions = async () => {
    await Promise.all([reloadMine(), reloadAvailable()]);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDuration = (session) => {
    if (session.durationMinutes === 0) return `${session.durationHours}h`;
    return `${session.durationHours}h ${session.durationMinutes}m`;
  };

  const isFull = (session) =>
    session.maxParticipants && session.participantsCount >= session.maxParticipants;

  const getTimeStatus = (session) => {
    if (!session.date || !session.time) return "future";
    const start = new Date(`${session.date}T${session.time}:00`).getTime();
    const totalMinutes = (session.durationHours || 0) * 60 + (session.durationMinutes || 0);
    const end = start + totalMinutes * 60 * 1000;
    if (now >= end) return "past";
    if (now >= start) return "inProgress";
    const startDate = new Date(start);
    const today = new Date(now);
    if (
      startDate.getFullYear() === today.getFullYear() &&
      startDate.getMonth() === today.getMonth() &&
      startDate.getDate() === today.getDate()
    ) {
      return "today";
    }
    return "future";
  };

  const getStatusText = (session) => {
    if (session.cancelled) return "Cancelada";
    if (isFull(session)) return "Completa";
    if (session.userStatus === "pending") return "Pendiente";
    return "Disponible";
  };

  const getStatusClass = (session) => {
    if (session.cancelled) return styles.statusFull;
    if (isFull(session)) return styles.statusFull;
    if (session.userStatus === "pending") return styles.statusPending;
    return styles.statusAvailable;
  };

  const renderCornerBadge = (session) => {
    if (session.cancelled) return null;
    const ts = getTimeStatus(session);
    if (ts === "inProgress") {
      return <span className={`${styles.cornerBadge} ${styles.cornerInProgress}`}>En curso</span>;
    }
    if (ts === "today") {
      return <span className={`${styles.cornerBadge} ${styles.cornerToday}`}>Hoy</span>;
    }
    return null;
  };

  const mySessions = useMemo(() => {
    const sortByDateDesc = (a, b) =>
      new Date(`${b.date}T${b.time || "00:00"}:00`).getTime() -
      new Date(`${a.date}T${a.time || "00:00"}:00`).getTime();
    return mine
      .filter((s) => s.userStatus === activeMyTab)
      .sort(sortByDateDesc);
  }, [mine, activeMyTab]);

  const openCreateForm = () => {
    setEditSession(null);
    setFormOpen(true);
  };

  const openEditForm = (session) => {
    setEditSession(session);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditSession(null);
  };

  const handleSubmitForm = async (payload) => {
    if (editSession) {
      await updateSession(editSession.id, payload);
    } else {
      await createSession(payload);
    }
    await reloadSessions();
    closeForm();
  };

  const handleJoinSession = async (session) => {
    setActionError("");
    try {
      await joinSession(session.id);
      await reloadSessions();
    } catch (err) {
      setActionError(err.message || "No pudimos completar la inscripción.");
    }
  };

  const handleConfirmCancel = async () => {
    setActionError("");
    try {
      await cancelSession(sessionToCancel.id);
      await reloadSessions();
    } catch (err) {
      setActionError(err.message || "No pudimos cancelar la sesión.");
    } finally {
      setSessionToCancel(null);
    }
  };

  const handleViewDetail = async (session) => {
    setActionError("");
    setDetailSession(session);
    try {
      const res = await getSession(session.id);
      setDetailSession(mapSessionFromApi(res.data));
    } catch {
      // si falla, queda el dato del listado
    }
  };

  const handleUploadFiles = async (files) => {
    if (!detailSession) return;

    await uploadSessionFiles(detailSession.id, files);
    const res = await getSession(detailSession.id);
    setDetailSession(mapSessionFromApi(res.data));
    await reloadSessions();
  };

  const handleDeleteFile = async (archivoId) => {
    if (!detailSession) return;

    await deleteSessionFile(detailSession.id, archivoId);
    const res = await getSession(detailSession.id);
    setDetailSession(mapSessionFromApi(res.data));
    await reloadSessions();
  };

  const handleApprove = async (inscripcionId) => {
    setActionError("");
    try {
      await approveParticipant(detailSession.id, inscripcionId);
      const res = await getSession(detailSession.id);
      setDetailSession(mapSessionFromApi(res.data));
      await reloadSessions();
    } catch (err) {
      setActionError(err.message || "No pudimos aprobar la solicitud.");
    }
  };

  const handleReject = async (inscripcionId) => {
    setActionError("");
    try {
      await rejectParticipant(detailSession.id, inscripcionId);
      const res = await getSession(detailSession.id);
      setDetailSession(mapSessionFromApi(res.data));
      await reloadSessions();
    } catch (err) {
      setActionError(err.message || "No pudimos rechazar la solicitud.");
    }
  };

  const formInitialValues = editSession
    ? {
        subject: String(editSession.materiaId ?? ""),
        topic: editSession.topic,
        type: editSession.type,
        meetingLink: editSession.type === "virtual" ? editSession.linkUbicacion : "",
        location: editSession.type === "presencial" ? editSession.linkUbicacion : "",
        date: editSession.date,
        time: editSession.time,
        durationHours: String(editSession.durationHours),
        durationMinutes: String(editSession.durationMinutes),
        maxParticipants: editSession.maxParticipants
          ? String(editSession.maxParticipants)
          : "",
        description: editSession.description,
        requiresApproval: editSession.requiresApproval,
      }
    : null;

  const getJoinButton = (session) => {
    if (isFull(session)) {
      return (
        <button className={styles.fullButton} disabled>
          Completa
        </button>
      );
    }
    if (session.userStatus === "joined") {
      return (
        <button className={styles.joinedButton} disabled>
          Inscripto
        </button>
      );
    }
    if (session.userStatus === "pending") {
      return (
        <button className={styles.pendingButton} disabled>
          Pendiente
        </button>
      );
    }
    return (
      <button className={styles.joinButton} onClick={() => handleJoinSession(session)}>
        Unirse
      </button>
    );
  };

  if (loading) {
    return (
      <div className={styles.screen}>
        <main className={styles.content}>
          <p className={styles.statusText}>Cargando sesiones…</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.screen}>
        <main className={styles.content}>
          <ErrorState title="No pudimos cargar las sesiones" description={error} />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <main className={styles.content}>
        <section className={styles.titleRow}>
          <h1>Sesiones de estudio</h1>

          <button className={styles.createButton} onClick={openCreateForm}>
            <Plus size={20} />
            Crear sesión
          </button>
        </section>

        <section className={styles.filterPanel}>
          <div className={styles.searchLine}>
            <div className={styles.searchBox}>
              <Search size={22} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por materia o tema..."
              />
            </div>

            <button
              className={`${styles.filtersButton} ${showFilters ? styles.filtersButtonActive : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={22} />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className={styles.filtersGrid}>
              <label>
                <span>Materia</span>
                <select
                  value={subjectFilter}
                  onChange={(e) => {
                    setSubjectFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Todas las materias</option>
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Tipo</span>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Todos</option>
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                </select>
              </label>
            </div>
          )}
        </section>

        {actionError && <p className={styles.actionError}>{actionError}</p>}

        <section className={styles.mySessionsBox}>
          <h2>Mis sesiones</h2>

          <div className={styles.tabs}>
            <button
              className={activeMyTab === "created" ? styles.activeTab : ""}
              onClick={() => setActiveMyTab("created")}
            >
              Creadas por mí
            </button>

            <button
              className={activeMyTab === "joined" ? styles.activeTab : ""}
              onClick={() => setActiveMyTab("joined")}
            >
              Inscripto
            </button>

            <button
              className={activeMyTab === "pending" ? styles.activeTab : ""}
              onClick={() => setActiveMyTab("pending")}
            >
              Pendientes
            </button>
          </div>

          {mySessions.length === 0 ? (
            <EmptyState
              title="No hay sesiones para mostrar"
              description="Cuando tengas sesiones en esta categoría, aparecerán acá."
            />
          ) : (
            mySessions.map((session) => (
              <article className={styles.mySessionItem} key={session.id}>
                <div>
                  <h3>
                    {session.subject}
                    <span className={`${styles.statusBadge} ${getStatusClass(session)}`}>
                      {getStatusText(session)}
                    </span>
                    <span className={styles.privacyBadge}>
                      {session.privacy === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                      {session.privacy === 'public' ? 'Pública' : 'Privada'}
                    </span>
                  </h3>

                  <p>{session.topic}</p>

                  <span className={styles.smallMeta}>
                    <CalendarDays size={14} />
                    {formatDate(session.date)} · {session.time}
                  </span>
                </div>

                <div className={styles.myActions}>
                  {renderCornerBadge(session)}
                  <button onClick={() => handleViewDetail(session)}>Ver detalle</button>

                  {session.userStatus === "created" && !session.cancelled && (
                    <>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label="Editar sesión"
                        onClick={() => openEditForm(session)}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-label="Cancelar sesión"
                        onClick={() => setSessionToCancel(session)}
                      >
                        <Trash2 size={18} className={styles.deleteIcon} />
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </section>

        <section className={styles.availableSection}>
          <h2>Sesiones disponibles</h2>

          {availableLoading ? (
            <p className={styles.statusText}>Cargando sesiones…</p>
          ) : available.length === 0 ? (
            <EmptyState
              title="No hay sesiones disponibles"
              description="Cuando haya sesiones de otros estudiantes, aparecerán acá."
            />
          ) : (
            <div className={styles.sessionsGrid}>
              {available.map((session) => (
                <article className={styles.sessionCard} key={session.id}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3>
                        {session.subject}
                        <span className={`${styles.statusBadge} ${getStatusClass(session)}`}>
                          {getStatusText(session)}
                        </span>
                      </h3>
                      <p>{session.topic}</p>
                    </div>

                    <div className={styles.cardTopRight}>
                      {renderCornerBadge(session)}
                      <button
                        type="button"
                        className={styles.moreButton}
                        aria-label="Ver detalle de la sesión"
                        onClick={() => handleViewDetail(session)}
                      >
                        <MoreVertical size={21} className={styles.moreIcon} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardMeta}>
                    <span>
                      {session.type === "virtual" ? <Video size={16} /> : <MapPin size={16} />}
                      {session.type === "virtual" ? "Virtual" : "Presencial"}
                    </span>

                    <span>
                      <CalendarDays size={16} />
                      {formatDate(session.date)} · {session.time}
                    </span>

                    <span>
                      <Clock size={16} />
                      {formatDuration(session)}
                    </span>

                    <span>
                      <Users size={16} />
                      {session.participantsCount}/{session.maxParticipants ?? "∞"} participantes
                    </span>

                    <span className={styles.privacyMeta}>
                      {session.privacy === 'public' ? <Globe size={16} /> : <Lock size={16} />}
                      {session.privacy === 'public' ? 'Pública' : 'Privada'}
                    </span>
                  </div>

                  <footer className={styles.cardFooter}>
                    <div className={styles.creator}>
                      <Avatar initials={session.creatorInitials} src={session.creatorImage} size="sm" />
                      <span>{session.creatorName}</span>
                    </div>

                    {getJoinButton(session)}
                  </footer>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.paginationSection}>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </section>
      </main>

      <Modal
        open={formOpen}
        title={editSession ? "Editar sesión" : "Crear nueva sesión"}
        onClose={closeForm}
        size="lg"
      >
        <SessionForm
          key={editSession?.id ?? "new"}
          materias={materias}
          initialValues={formInitialValues}
          onCancel={closeForm}
          onSubmit={handleSubmitForm}
        />
      </Modal>

      {detailSession && (
        <SessionDetailModal
          session={detailSession}
          open
          onClose={() => setDetailSession(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onUploadFiles={handleUploadFiles}
          onDeleteFile={handleDeleteFile}
          actionError={actionError}
        />
      )}

      <ModalConfirmation
        open={Boolean(sessionToCancel)}
        title="Cancelar sesión"
        message={`¿Seguro que querés cancelar la sesión de ${sessionToCancel?.subject ?? ""}? Esta acción no se puede deshacer.`}
        confirmText="Cancelar sesión"
        cancelText="Volver"
        variant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setSessionToCancel(null)}
      />
    </div>
  );
}

export default StudySessions;
