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
} from "lucide-react";

import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import ModalConfirmation from "../../components/common/ModalConfirmation";
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
} from "../../services/sessionService";
import { getMaterias } from "../../services/materialService";
import { mapSessionFromApi } from "./sessions/mapSession";
import styles from "./StudySessions.module.css";

function StudySessions() {
  const [sessions, setSessions] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const [formOpen, setFormOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [detailSession, setDetailSession] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [activeMyTab, setActiveMyTab] = useState("created");

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nextDate");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Promise.all([getSessions(), getMaterias()])
      .then(([sesRes, matRes]) => {
        setSessions((sesRes?.data ?? []).map(mapSessionFromApi));
        setMaterias(matRes?.data ?? []);
      })
      .catch((err) => {
        setError(err.message || "No pudimos cargar las sesiones.");
      })
      .finally(() => setLoading(false));
  }, []);

  const reloadSessions = async () => {
    const res = await getSessions();
    setSessions((res?.data ?? []).map(mapSessionFromApi));
  };

  const subjects = [...new Set(sessions.map((session) => session.subject))];

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
    if (getTimeStatus(session) === "past") return "Finalizada";
    if (isFull(session)) return "Completa";
    if (session.userStatus === "pending") return "Pendiente";
    return "Disponible";
  };

  const getStatusClass = (session) => {
    if (session.cancelled) return styles.statusFull;
    if (getTimeStatus(session) === "past") return styles.statusEnded;
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
    const isPast = (session) => {
      if (!session.date || !session.time) return false;
      const start = new Date(`${session.date}T${session.time}:00`).getTime();
      const totalMinutes = (session.durationHours || 0) * 60 + (session.durationMinutes || 0);
      return now >= start + totalMinutes * 60 * 1000;
    };
    const mine = sessions.filter((s) =>
      ["created", "joined", "pending"].includes(s.userStatus)
    );
    const sortByDateDesc = (a, b) =>
      new Date(`${b.date}T${b.time || "00:00"}:00`).getTime() -
      new Date(`${a.date}T${a.time || "00:00"}:00`).getTime();
    if (activeMyTab === "finished") {
      return mine.filter(isPast).sort(sortByDateDesc);
    }
    return mine
      .filter((s) => s.userStatus === activeMyTab && !isPast(s))
      .sort(sortByDateDesc);
  }, [sessions, activeMyTab, now]);

  const availableSessions = useMemo(() => {
    let result = sessions.filter(
      (session) => session.userStatus !== "created" && !session.cancelled
    );

    if (search.trim()) {
      const value = search.toLowerCase();
      result = result.filter(
        (session) =>
          session.subject.toLowerCase().includes(value) ||
          session.topic.toLowerCase().includes(value)
      );
    }

    if (subjectFilter !== "all") {
      result = result.filter((session) => session.subject === subjectFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((session) => session.type === typeFilter);
    }

    if (availabilityFilter === "available") {
      result = result.filter((session) => !isFull(session));
    }

    if (availabilityFilter === "full") {
      result = result.filter((session) => isFull(session));
    }

    result.sort((a, b) => {
      if (sortBy === "spots") {
        const spotsA = a.maxParticipants ? a.maxParticipants - a.participantsCount : 999;
        const spotsB = b.maxParticipants ? b.maxParticipants - b.participantsCount : 999;
        return spotsB - spotsA;
      }
      return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
    });

    return result;
  }, [sessions, search, subjectFilter, typeFilter, availabilityFilter, sortBy]);

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
    if (getTimeStatus(session) === "past") {
      return (
        <button className={styles.fullButton} disabled>
          Finalizada
        </button>
      );
    }
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
                <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                  <option value="all">Todas las materias</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Tipo</span>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">Todos</option>
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                </select>
              </label>

              <label>
                <span>Disponibilidad</span>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="all">Todas</option>
                  <option value="available">Con cupo</option>
                  <option value="full">Llenas</option>
                </select>
              </label>

              <label>
                <span>Ordenar por</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="nextDate">Fecha próxima</option>
                  <option value="spots">Cupos disponibles</option>
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

            <button
              className={activeMyTab === "finished" ? styles.activeTab : ""}
              onClick={() => setActiveMyTab("finished")}
            >
              Finalizadas
            </button>
          </div>

          {mySessions.length === 0 ? (
            <EmptyState
              title="No hay sesiones para mostrar"
              description="Cuando tengas sesiones en esta categoría, aparecerán acá."
            />
          ) : (
            mySessions.map((session) => (
              <article
                className={`${styles.mySessionItem} ${getTimeStatus(session) === "past" ? styles.sessionCardPast : ""}`}
                key={session.id}
              >
                <div>
                  <h3>
                    {session.subject}
                    <span className={`${styles.statusBadge} ${getStatusClass(session)}`}>
                      {getStatusText(session)}
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

          {availableSessions.length === 0 ? (
            <EmptyState
              title="No hay sesiones disponibles"
              description="Cuando haya sesiones de otros estudiantes, aparecerán acá."
            />
          ) : (
            <div className={styles.sessionsGrid}>
              {availableSessions.map((session) => (
                <article
                  className={`${styles.sessionCard} ${getTimeStatus(session) === "past" ? styles.sessionCardPast : ""}`}
                  key={session.id}
                >
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
                  </div>

                  <footer className={styles.cardFooter}>
                    <div className={styles.creator}>
                      <div className={styles.creatorAvatar}>{session.creatorInitials}</div>
                      <span>{session.creatorName}</span>
                    </div>

                    {getJoinButton(session)}
                  </footer>
                </article>
              ))}
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
