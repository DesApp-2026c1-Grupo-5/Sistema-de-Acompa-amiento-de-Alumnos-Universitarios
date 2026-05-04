import { useMemo, useState } from "react";
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
import SessionForm from "./SessionForm";
import styles from "./StudySessions.module.css";

const currentUser = {
  id: 1,
  initials: "FG",
  name: "Federico García",
  contactIds: [2, 3],
  profilePrivacy: "public",
};

const initialSessions = [
  {
    id: 1,
    subject: "Algoritmos y Estructuras",
    topic: "Árboles binarios y recorridos",
    type: "virtual",
    date: "2026-04-24",
    time: "18:00",
    durationHours: 2,
    durationMinutes: 30,
    maxParticipants: 15,
    participantsCount: 8,
    creatorId: 2,
    creatorName: "María López",
    creatorInitials: "ML",
    status: "available",
    userStatus: "none",
  },
  {
    id: 2,
    subject: "Base de Datos",
    topic: "Normalización y diseño de BD",
    type: "presencial",
    date: "2026-04-25",
    time: "16:00",
    durationHours: 3,
    durationMinutes: 0,
    maxParticipants: 12,
    participantsCount: 12,
    creatorId: 4,
    creatorName: "Carlos Rodríguez",
    creatorInitials: "CR",
    status: "full",
    userStatus: "none",
  },
  {
    id: 3,
    subject: "Redes",
    topic: "Protocolos TCP/IP",
    type: "virtual",
    date: "2026-04-26",
    time: "19:00",
    durationHours: 2,
    durationMinutes: 0,
    maxParticipants: 10,
    participantsCount: 5,
    creatorId: 3,
    creatorName: "Ana Martínez",
    creatorInitials: "AM",
    status: "available",
    userStatus: "pending",
    requiresApproval: true,
  },
  {
    id: 4,
    subject: "Programación III",
    topic: "Patrones de diseño",
    type: "virtual",
    date: "2026-04-27",
    time: "17:30",
    durationHours: 2,
    durationMinutes: 0,
    maxParticipants: 15,
    participantsCount: 10,
    creatorId: 1,
    creatorName: "Federico García",
    creatorInitials: "FG",
    status: "available",
    userStatus: "created",
  },
];

function StudySessions() {
  const [sessions, setSessions] = useState(initialSessions);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMyTab, setActiveMyTab] = useState("created");
  const [detailSession, setDetailSession] = useState(null);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nextDate");
  const [onlyContacts, setOnlyContacts] = useState(false);

  const subjects = [...new Set(sessions.map((session) => session.subject))];

  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDuration = (session) => {
    if (session.durationMinutes === 0) return `${session.durationHours}h`;
    return `${session.durationHours}h ${session.durationMinutes}m`;
  };

  const isFull = (session) => {
    return session.maxParticipants && session.participantsCount >= session.maxParticipants;
  };

  const getStatusText = (session) => {
    if (isFull(session)) return "Completa";
    if (session.userStatus === "pending") return "Pendiente";
    return "Disponible";
  };

  const getStatusClass = (session) => {
    if (isFull(session)) return styles.statusFull;
    if (session.userStatus === "pending") return styles.statusPending;
    return styles.statusAvailable;
  };

  const mySessions = useMemo(() => {
    if (activeMyTab === "created") {
      return sessions.filter((session) => session.creatorId === currentUser.id);
    }

    if (activeMyTab === "joined") {
      return sessions.filter((session) => session.userStatus === "joined");
    }

    return sessions.filter((session) => session.userStatus === "pending");
  }, [sessions, activeMyTab]);

  const availableSessions = useMemo(() => {
    let result = sessions.filter((session) => session.creatorId !== currentUser.id);

    if (onlyContacts) {
      result = result.filter((session) => currentUser.contactIds.includes(session.creatorId));
    }

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
  }, [sessions, search, subjectFilter, typeFilter, availabilityFilter, sortBy, onlyContacts]);

  const handleCreateSession = (newSession) => {
    const sessionToAdd = {
      id: Date.now(),
      ...newSession,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorInitials: currentUser.initials,
      participantsCount: 0,
      status: "available",
      userStatus: "created",
    };

    setSessions((prev) => [sessionToAdd, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleJoinSession = (session) => {
    if (isFull(session)) return;

    setSessions((prev) =>
      prev.map((item) => {
        if (item.id !== session.id) return item;

        if (item.requiresApproval) {
          return {
            ...item,
            userStatus: "pending",
          };
        }

        return {
          ...item,
          userStatus: "joined",
          participantsCount: item.participantsCount + 1,
        };
      })
    );
  };

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

  return (
    <div className={styles.screen}>
      <main className={styles.content}>
        <section className={styles.titleRow}>
          <h1>Sesiones de estudio</h1>

          <button className={styles.createButton} onClick={() => setIsCreateModalOpen(true)}>
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

              <label className={styles.checkboxFilter}>
                <input
                  type="checkbox"
                  checked={onlyContacts}
                  onChange={(e) => setOnlyContacts(e.target.checked)}
                />
                Solo sesiones de contactos
              </label>
            </div>
          )}
        </section>

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
                  <button onClick={() => setDetailSession(session)}>Ver detalle</button>

                  {session.creatorId === currentUser.id && (
                    <>
                      <Edit size={18} />
                      <Trash2 size={18} className={styles.deleteIcon} />
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </section>

        <section className={styles.availableSection}>
          <h2>Sesiones disponibles</h2>

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
                    {session.participantsCount}/{session.maxParticipants} participantes
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
        </section>
      </main>

      <Modal
        open={isCreateModalOpen}
        title="Crear nueva sesión"
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
      >
        <SessionForm
          onCancel={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSession}
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
            <p>Fecha: {formatDate(detailSession.date)} · {detailSession.time}</p>
            <p>Duración: {formatDuration(detailSession)}</p>
            <p>
              Participantes: {detailSession.participantsCount}/{detailSession.maxParticipants}
            </p>
            <p>Creador: {detailSession.creatorName}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StudySessions;