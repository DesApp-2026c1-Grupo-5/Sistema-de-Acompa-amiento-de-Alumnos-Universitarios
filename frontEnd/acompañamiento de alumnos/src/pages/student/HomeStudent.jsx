import { useMemo, useState } from 'react';
import PageTitle from '../../components/common/PageTitle';
import SearchBar from '../../components/common/SearchBar';
import PublicationsList from '../../components/profile/PublicationsList';
import CreatePostCard from '../../components/home/CreatePostCard';
import UpcomingSessionsCard from '../../components/home/UpcomingSessionsCard';
import {
  currentUser,
  publications as initialPublications,
  upcomingSessions,
} from './home/mockData';
import styles from './HomeStudent.module.css';

function formatTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function HomeStudent() {
  const [publications, setPublications] = useState(initialPublications);
  const [searchTerm, setSearchTerm] = useState('');
  const [userReactions, setUserReactions] = useState({});

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

  const handlePublish = (content) => {
    const newPost = {
      id: Date.now(),
      type: 'post',
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorInitials: currentUser.initials,
      date: formatTodayISO(),
      content,
      likes: 0,
      dislikes: 0,
    };
    setPublications((prev) => [newPost, ...prev]);
  };

  const handleReaction = (postId, reaction) => {
    setUserReactions((prevReactions) => {
      const previous = prevReactions[postId] ?? null;
      const next = previous === reaction ? null : reaction;

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

      return { ...prevReactions, [postId]: next };
    });
  };

  const handleLike = (postId) => handleReaction(postId, 'like');
  const handleDislike = (postId) => handleReaction(postId, 'dislike');
  const handleViewSessionDetails = () => {
    // TODO: navegar al detalle de sesión cuando exista la ruta
  };

  return (
    <div className={styles.page}>
      <PageTitle
        title="Inicio"
        description="Tu feed académico: novedades, eventos y publicaciones de tus compañeros."
      />

      <div className={styles.grid}>
        <div className={styles.main}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar publicaciones..."
          />

          <CreatePostCard user={currentUser} onPublish={handlePublish} />

          <PublicationsList
            publications={filteredPublications}
            userReactions={userReactions}
            onLike={handleLike}
            onDislike={handleDislike}
            title="Feed"
            emptyMessage={
              searchTerm
                ? 'No encontramos publicaciones que coincidan con tu búsqueda.'
                : 'Todavía no hay publicaciones. ¡Sé el primero en compartir algo!'
            }
          />
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
