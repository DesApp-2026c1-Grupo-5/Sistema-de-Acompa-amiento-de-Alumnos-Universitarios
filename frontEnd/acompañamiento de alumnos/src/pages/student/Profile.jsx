import { useEffect, useState } from 'react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ContactList from '../../components/profile/ContactList';
import PendingRequests from '../../components/profile/PendingRequests';
import PublicationsList from '../../components/profile/PublicationsList';
import ErrorState from '../../components/common/ErrorState';
import { getMyProfile, updateMyPrivacy } from '../../services/profileService';
import { votePost } from '../../services/postService';
import styles from './Profile.module.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message || 'No pudimos cargar el perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const handleEditProfile = (data) => {
    setProfile((prev) => ({ ...prev, user: { ...prev.user, ...data } }));
  };

  const handleToggleVisibility = async () => {
    const actual = profile?.user?.privacidad;
    const nuevo = actual === 'publico' ? 'privado' : 'publico';
    try {
      const res = await updateMyPrivacy(nuevo);
      setProfile((prev) => ({
        ...prev,
        user: { ...prev.user, privacidad: res.data?.privacidad ?? nuevo },
      }));
    } catch {
      // si falla, la privacidad queda sin cambios
    }
  };

  const handleVote = async (postId, tipo) => {
    try {
      const res = await votePost(postId, tipo);
      setProfile((prev) => ({
        ...prev,
        publications: prev.publications.map((p) =>
          p.id === postId
            ? { ...p, likes: res.data.likes, dislikes: res.data.dislikes }
            : p
        ),
        userReactions: { ...prev.userReactions, [postId]: res.data.mi_voto },
      }));
    } catch {
      // si el voto falla, el contador queda sin cambios
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.statusText}>Cargando perfil…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.container}>
        <ErrorState
          title="No pudimos cargar el perfil"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProfileHeader
        user={profile.user}
        onEditProfile={handleEditProfile}
        onToggleVisibility={handleToggleVisibility}
      />

      <ContactList contacts={profile.contacts} />

      <PendingRequests requests={profile.pendingRequests} />

      {profile.user.bio && (
        <section className={styles.aboutCard}>
          <h2>Acerca de</h2>
          <p>{profile.user.bio}</p>
        </section>
      )}

      <PublicationsList
        publications={profile.publications}
        userReactions={profile.userReactions}
        onLike={(id) => handleVote(id, 'like')}
        onDislike={(id) => handleVote(id, 'dislike')}
      />
    </div>
  );
}

export default Profile;
