import { useEffect, useState } from 'react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ContactList from '../../components/profile/ContactList';
import PendingRequests from '../../components/profile/PendingRequests';
import PublicationsList from '../../components/profile/PublicationsList';
import ErrorState from '../../components/common/ErrorState';
import {
  getMyProfile,
  updateMyPrivacy,
  updateMyProfile,
  uploadAvatar,
  deleteAvatar,
  uploadBanner,
  deleteBanner,
} from '../../services/profileService';
import { votePost } from '../../services/postService';
import { useAuth } from '../../context/useAuth';
import styles from './Profile.module.css';

function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const syncAuthFoto = (foto_url) => {
    updateUser({ estudiante: { ...(user?.estudiante ?? {}), foto_url } });
  };

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setProfile(res.data);
        if ((user?.estudiante?.foto_url ?? null) !== (res.data.user.foto_url ?? null)) {
          syncAuthFoto(res.data.user.foto_url);
        }
      })
      .catch((err) => setError(err.message || 'No pudimos cargar el perfil.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditProfile = async (data) => {
    const fullName = (data.name ?? '').trim();
    const [nombre, ...resto] = fullName.split(/\s+/);
    const apellido = resto.join(' ');

    await updateMyProfile({
      nombre,
      apellido,
      bio: data.bio,
      career: data.career,
    });

    setProfile((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        name: fullName,
        bio: data.bio,
        career: data.career,
      },
    }));
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

  const handleUploadAvatar = async (file) => {
    const res = await uploadAvatar(file);
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, foto_url: res.data.foto_url },
    }));
    syncAuthFoto(res.data.foto_url);
  };

  const handleDeleteAvatar = async () => {
    await deleteAvatar();
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, foto_url: null },
    }));
    syncAuthFoto(null);
  };

  const handleUploadBanner = async (file) => {
    const res = await uploadBanner(file);
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, banner_url: res.data.banner_url },
    }));
  };

  const handleDeleteBanner = async () => {
    await deleteBanner();
    setProfile((prev) => ({
      ...prev,
      user: { ...prev.user, banner_url: null },
    }));
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
        onUploadAvatar={handleUploadAvatar}
        onDeleteAvatar={handleDeleteAvatar}
        onUploadBanner={handleUploadBanner}
        onDeleteBanner={handleDeleteBanner}
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
