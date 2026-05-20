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

  const getStatusText = (session) => {
    if (session.cancelled) return "Cancelada";
    if (isFull(session)) return "Completa";
    if (session.userStatus === "pending") return "Pendiente";
    return "Disponible";
  };

  const getStatusClass = (session) => {
    if (session.cancelled || isFull(session)) return styles.statusFull;
    if (session.userStatus === "pending") return styles.statusPending;
    return styles.statusAvailable;
  };

  const mySessions = useMemo(() => {
    if (activeMyTab === "created") {
      return sessions.filter((session) => session.userStatus === "created");
    }
    if (activeMyTab === "joined") {
      return sessions.filter((session) => session.userStatus === "joined");
    }
    return sessions.filter((session) => session.userStatus === "pending");
  }, [sessions, activeMyTab]);

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
      return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
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
                  </h3>

                  <p>{session.topic}</p>

                  <span className={styles.smallMeta}>
                    <CalendarDays size={14} />
                    {formatDate(session.date)} · {session.time}
                  </span>
                </div>

                <div className={styles.myActions}>
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

                    <MoreVertical size={21} className={styles.moreIcon} />
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

      <Modal
        open={Boolean(detailSession)}
        title="Detalle de sesión"
        onClose={() => setDetailSession(null)}
        size="md"
      >
        {detailSession && (
          <div className={styles.detailBox}>
            <h3>{detailSession.subject}</h3>
            <p>{detailSession.topic}</p>
            <p>Tipo: {detailSession.type === "virtual" ? "Virtual" : "Presencial"}</p>
            <p>
              Fecha: {formatDate(detailSession.date)} · {detailSession.time}
            </p>
            <p>Duración: {formatDuration(detailSession)}</p>
            <p>
              Participantes: {detailSession.participantsCount}/
              {detailSession.maxParticipants ?? "∞"}
            </p>
            <p>Creador: {detailSession.creatorName}</p>
            {detailSession.description && <p>{detailSession.description}</p>}

            {detailSession.userStatus === "created" &&
              detailSession.pendingRequests?.length > 0 && (
                <div className={styles.pendingBox}>
                  <h4>Solicitudes pendientes</h4>
                  {detailSession.pendingRequests.map((req) => (
                    <div key={req.inscripcionId} className={styles.pendingItem}>
                      <span>{req.name}</span>
                      <div className={styles.pendingActions}>
                        <button
                          type="button"
                          className={styles.approveBtn}
                          onClick={() => handleApprove(req.inscripcionId)}
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          className={styles.rejectBtn}
                          onClick={() => handleReject(req.inscripcionId)}
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
