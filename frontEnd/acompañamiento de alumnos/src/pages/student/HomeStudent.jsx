import { useEffect, useMemo, useState } from 'react';
import PageTitle from '../../components/common/PageTitle';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import CreatePostCard from '../../components/home/CreatePostCard';
import FeedPost from '../../components/home/FeedPost';
import UpcomingSessionsCard from '../../components/home/UpcomingSessionsCard';
import { useAuth } from '../../context/useAuth';
import { getPosts, createPost } from '../../services/postService';
import { upcomingSessions } from './home/mockData';
import { getInitials, mapPostFromApi } from './home/mapPost';
import styles from './HomeStudent.module.css';

function HomeStudent() {
  const { user } = useAuth();
  const est = user?.estudiante ?? {};

  const currentUser = {
    id: est.id,
    name: `${est.nombre ?? ''} ${est.apellido ?? ''}`.trim() || 'Estudiante',
    initials: getInitials(est.nombre, est.apellido),
  };

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishError, setPublishError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userReactions, setUserReactions] = useState({});

  useEffect(() => {
    getPosts()
      .then((res) => {
        setPublications((res?.data ?? []).map(mapPostFromApi));
      })
      .catch((err) => {
        setError(err.message || 'No pudimos cargar el feed.');
      })
      .finally(() => setLoading(false));
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

  const handleReaction = (postId, reaction) => {
    const previous = userReactions[postId] ?? null;
    const next = previous === reaction ? null : reaction;

    setUserReactions((prev) => ({ ...prev, [postId]: next }));

    setPublications((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;
        const updated = { ...post };
        if (previous === 'like') updated.likes = Math.max(0, (updated.likes ?? 0) - 1);
        if (previous === 'dislike') updated.dislikes = Math.max(0, (updated.dislikes ?? 0) - 1);
        if (next === 'like') updated.likes = (updated.likes ?? 0) + 1;
        if (next === 'dislike') updated.dislikes = (updated.dislikes ?? 0) + 1;
        return updated;
      }),
    );
  };

  const handleLike = (postId) => handleReaction(postId, 'like');
  const handleDislike = (postId) => handleReaction(postId, 'dislike');
  const handleViewSessionDetails = () => {
    // TODO: navegar al detalle de sesión cuando exista la ruta
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
        userReaction={userReactions[post.id] ?? null}
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

          <div className={styles.feed}>{renderFeed()}</div>
        </div>

        <aside className={styles.aside}>
          <UpcomingSessionsCard
            sessions={upcomingSessions}
            onViewDetails={handleViewSessionDetails}
          />
        </aside>
      </div>
    </div>
  );
}

export default HomeStudent;
