import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import PageTitle from '../../components/common/PageTitle';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import CreatePostCard from '../../components/home/CreatePostCard';
import FeedPost from '../../components/home/FeedPost';
import UpcomingSessionsCard from '../../components/home/UpcomingSessionsCard';
import SessionDetailModal from '../../components/sessions/SessionDetailModal';
import { useAuth } from '../../context/useAuth';
import { getPosts, createPost, votePost } from '../../services/postService';
import { getSessions, getSession } from '../../services/sessionService';
import { getInitials, mapPostFromApi } from './home/mapPost';
import { mapSessionFromApi } from './sessions/mapSession';
import styles from './HomeStudent.module.css';

const PAGE_SIZE = 10;

function HomeStudent() {
  const { user } = useAuth();
  const est = user?.estudiante ?? {};

  const currentUser = {
    id: est.id,
    name: `${est.nombre ?? ''} ${est.apellido ?? ''}`.trim() || 'Estudiante',
    initials: getInitials(est.nombre, est.apellido),
    image: est.foto_url ?? null,
  };

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [publishError, setPublishError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const loaderRef = useRef(null);
  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);

  const [mySessions, setMySessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);
  const [detailSession, setDetailSession] = useState(null);

  const fetchPage = useCallback((pageNum) => {
    return getPosts({ page: pageNum, limit: PAGE_SIZE }).then((res) => {
      const mapped = (res?.data ?? []).map(mapPostFromApi);
      setPublications((prev) => (pageNum === 1 ? mapped : [...prev, ...mapped]));
      const more = res?.pagination?.hasMore ?? false;
      hasMoreRef.current = more;
      pageRef.current = pageNum;
      setHasMore(more);
    });
  }, []);

  useEffect(() => {
    fetchPage(1)
      .catch((err) => setError(err.message || 'No pudimos cargar el feed.'))
      .finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    fetchPage(pageRef.current + 1)
      .catch((err) => setError(err.message || 'No pudimos cargar más publicaciones.'))
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [fetchPage]);

  useEffect(() => {
    if (!hasMore || searchTerm) return undefined;
    const el = loaderRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, searchTerm, loading, loadMore]);

  useEffect(() => {
    getSessions()
      .then((res) => {
        const all = (res?.data ?? []).map(mapSessionFromApi);
        const now = Date.now();
        const mias = all
          .filter((s) => s.userStatus === 'joined')
          .filter((s) => !s.cancelled)
          .filter((s) => {
            if (!s.date || !s.time) return true;
            const start = new Date(`${s.date}T${s.time}:00`).getTime();
            const totalMinutes = (s.durationHours || 0) * 60 + (s.durationMinutes || 0);
            return now < start + totalMinutes * 60 * 1000;
          })
          .sort((a, b) => {
            const da = new Date(`${a.date}T${a.time || '00:00'}:00`).getTime();
            const db = new Date(`${b.date}T${b.time || '00:00'}:00`).getTime();
            return da - db;
          })
          .slice(0, 5);
        setMySessions(mias);
      })
      .catch((err) => setSessionsError(err.message || 'No pudimos cargar tus sesiones.'))
      .finally(() => setSessionsLoading(false));
  }, []);

  const filteredPublications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return publications;
    return publications.filter((post) => {
      return (
        post.content.toLowerCase().includes(term) ||
        post.authorName.toLowerCase().includes(term) ||
        (post.eventSubject?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [publications, searchTerm]);

  const handlePublish = async (content) => {
    setPublishError('');
    setPublishing(true);
    try {
      const res = await createPost(content);
      const nuevo = mapPostFromApi({
        ...res.data,
        estudiante: {
          id: est.id,
          nombre: est.nombre,
          apellido: est.apellido,
          foto_url: est.foto_url ?? null,
        },
      });
      setPublications((prev) => [nuevo, ...prev]);
    } catch (err) {
      setPublishError(err.message || 'No pudimos publicar, intentá de nuevo.');
      throw err;
    } finally {
      setPublishing(false);
    }
  };

  const handleReaction = async (postId, tipo) => {
    try {
      const res = await votePost(postId, tipo);
      setPublications((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              likes: res.data.likes,
              dislikes: res.data.dislikes,
              miVoto: res.data.mi_voto,
            }
            : p,
        ),
      );
    } catch (err) {
      setPublishError(err.message || 'No pudimos registrar tu voto.');
    }
  };

  const handleLike = (postId) => handleReaction(postId, 'like');
  const handleDislike = (postId) => handleReaction(postId, 'dislike');
  const handleViewSessionDetails = async (sessionId) => {
    const target = mySessions.find((s) => s.id === sessionId);
    if (!target) return;
    setDetailSession(target);
    try {
      const res = await getSession(sessionId);
      setDetailSession(mapSessionFromApi(res.data));
    } catch {
      // si falla, queda el dato del listado
    }
  };

  const renderFeed = () => {
    if (loading) {
      return <p className={styles.feedStatus}>Cargando publicaciones…</p>;
    }

    if (error) {
      return (
        <ErrorState
          title="No pudimos cargar el feed"
          description={error}
        />
      );
    }

    if (filteredPublications.length === 0) {
      return (
        <EmptyState
          title={searchTerm ? 'Sin resultados' : 'El feed está vacío'}
          description={
            searchTerm
              ? 'No encontramos publicaciones que coincidan con tu búsqueda.'
              : 'Cuando vos o tus compañeros publiquen algo, aparecerá acá.'
          }
        />
      );
    }

    return filteredPublications.map((post) => (
      <FeedPost
        key={post.id}
        post={post}
        userReaction={post.miVoto}
        onLike={handleLike}
        onDislike={handleDislike}
      />
    ));
  };

  return (
    <div className={styles.page}>
      <PageTitle
        title="Inicio"
        description="Tu feed académico: novedades, eventos y publicaciones de tus compañeros."
      />

      <div className={styles.grid}>
        <div className={styles.main}>
          <div className={styles.searchWrapper}>
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar publicaciones..."
            />
          </div>

          <CreatePostCard
            user={currentUser}
            onPublish={handlePublish}
            loading={publishing}
          />
          {publishError && (
            <p className={styles.feedStatus}>{publishError}</p>
          )}

          <div className={styles.feed}>
            {renderFeed()}
            {!loading && !error && !searchTerm && hasMore && (
              <div ref={loaderRef} className={styles.feedSentinel}>
                {loadingMore && (
                  <p className={styles.feedStatus}>Cargando más publicaciones…</p>
                )}
              </div>
            )}
          </div>
        </div>

        <>
          <aside className={styles.aside}>
            <UpcomingSessionsCard
              sessions={mySessions}
              loading={sessionsLoading}
              error={sessionsError}
              onViewDetails={handleViewSessionDetails}
            />
          </aside>

          <button
            type="button"
            className={styles.mobileSessionsButton}
            onClick={() => setSessionsOpen(true)}
          >
            <CalendarDays size={20} />
            Mis sesiones
          </button>

          {sessionsOpen && (
            <>
              <div
                className={styles.mobileSessionsOverlay}
                onClick={() => setSessionsOpen(false)}
              />

              <div className={styles.mobileSessionsModal}>
                <div className={styles.mobileSessionsHeader}>
                  <h3>Mis sesiones</h3>

                  <button
                    type="button"
                    onClick={() => setSessionsOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                <UpcomingSessionsCard
                  sessions={mySessions}
                  loading={sessionsLoading}
                  error={sessionsError}
                  onViewDetails={handleViewSessionDetails}
                />
              </div>
            </>
          )}
        </>
      </div>

      {detailSession && (
        <SessionDetailModal
          session={detailSession}
          open
          onClose={() => setDetailSession(null)}
        />
      )}
    </div>
  );
}

export default HomeStudent;
