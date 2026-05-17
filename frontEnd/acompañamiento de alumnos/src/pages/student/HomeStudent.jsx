import { useMemo, useState } from 'react';
import PageTitle from '../../components/common/PageTitle';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import CreatePostCard from '../../components/home/CreatePostCard';
import FeedPost from '../../components/home/FeedPost';
import UpcomingSessionsCard from '../../components/home/UpcomingSessionsCard';
import {
  currentUser,
  publications as initialPublications,
  upcomingSessions,
} from './home/mockData';
import styles from './HomeStudent.module.css';

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
      createdAt: new Date().toISOString(),
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
          <div className={styles.searchWrapper}>
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar publicaciones..."
            />
          </div>

          <CreatePostCard user={currentUser} onPublish={handlePublish} />

          <div className={styles.feed}>
            {filteredPublications.length > 0 ? (
              filteredPublications.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  userReaction={userReactions[post.id] ?? null}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              ))
            ) : (
              <EmptyState
                title={searchTerm ? 'Sin resultados' : 'El feed está vacío'}
                description={
                  searchTerm
                    ? 'No encontramos publicaciones que coincidan con tu búsqueda.'
                    : 'Cuando vos o tus compañeros publiquen algo, aparecerá acá.'
                }
              />
            )}
          </div>
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
