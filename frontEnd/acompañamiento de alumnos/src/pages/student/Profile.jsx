import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ContactList from '../../components/profile/ContactList';
import PendingRequests from '../../components/profile/PendingRequests';
import PublicationsList from '../../components/profile/PublicationsList';
import UserSearchModal from '../../components/profile/UserSearchModal';
import ModalConfirmation from '../../components/common/ModalConfirmation';
import Avatar from '../../components/common/Avatar';
import ErrorState from '../../components/common/ErrorState';
import { cambiarEstadoEstudianteAdmin } from '../../services/adminHomeService';
import {
  getMyProfile,
  getProfileById,
  updateMyPrivacy,
  updateMyProfile,
  uploadAvatar,
  deleteAvatar,
  uploadBanner,
  deleteBanner,
} from '../../services/profileService';
import { deletePost, votePost } from '../../services/postService';
import { useAuth } from '../../context/useAuth';
import styles from './Profile.module.css';

function Profile() {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const isAdmin = user?.tipo === 'administrador';
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [changingAccountStatus, setChangingAccountStatus] = useState(false);
  const [accountStatusError, setAccountStatusError] = useState('');
  const [postToDelete, setPostToDelete] = useState(null);
  const [deletingPost, setDeletingPost] = useState(false);

  const ownId = user?.estudiante?.id;
  const isOwnProfile = !userId || String(userId) === String(ownId);

  const syncAuthFoto = (foto_url) => {
    updateUser({ estudiante: { ...(user?.estudiante ?? {}), foto_url } });
  };

  useEffect(() => {
    const fetch = isOwnProfile ? getMyProfile() : getProfileById(userId);
    fetch
      .then((res) => {
        setProfile(res.data);
        if (isOwnProfile && (user?.estudiante?.foto_url ?? null) !== (res.data.user.foto_url ?? null)) {
          syncAuthFoto(res.data.user.foto_url);
        }
      })
      .catch((err) => setError(err.message || 'No pudimos cargar el perfil.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleEditProfile = async (data) => {
    const fullName = (data.name ?? '').trim();
    const [nombre, ...resto] = fullName.split(/\s+/);
    const apellido = resto.join(' ');

    const res = await updateMyProfile({
      nombre,
      apellido,
      bio: data.bio,
      localidad: data.localidad,
      telefono: data.phone,
      fecha_nacimiento: data.birthDate,
      pub_inscripciones: data.autoPublish.enrollment,
      pub_regularizaciones: data.autoPublish.regular,
      pub_aprobaciones: data.autoPublish.approved,
    });

    const updated = res.data;

    setProfile((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        name: updated.name,
        bio: updated.bio,
        location: updated.location,
        phone: updated.phone,
        birthDate: updated.birthDate,
        pub_inscripciones: updated.pub_inscripciones,
        pub_regularizaciones: updated.pub_regularizaciones,
        pub_aprobaciones: updated.pub_aprobaciones,
      },
    }));

    return res;
  };

  const handleToggleVisibility = async () => {
    const actual = profile?.user?.privacidad;
    const nuevo = actual === 'publico' ? 'privado' : 'publico';
    try {
      const res = await updateMyPrivacy({ privacidad: nuevo });
      setProfile((prev) => ({
        ...prev,
        user: { ...prev.user, privacidad: res.data?.privacidad ?? nuevo },
      }));
    } catch {
      // si falla, la privacidad queda sin cambios
    }
  };

  const handleToggleEmail = async () => {
    const actual = profile?.user?.email_visible;
    const nuevo = actual === false;
    try {
      const res = await updateMyPrivacy({ email_visible: nuevo });
      setProfile((prev) => ({
        ...prev,
        user: { ...prev.user, email_visible: res.data?.email_visible ?? nuevo },
      }));
    } catch {
      // si falla, la visibilidad del email queda sin cambios
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

  const handleToggleAccountStatus = async () => {
    if (!isAdmin || !userId || !profile?.user) {
      return;
    }

    const nextStatus = !profile.user.activo;

    const confirmationMessage = nextStatus
      ? '¿Querés reactivar esta cuenta? El estudiante podrá volver a ingresar.'
      : '¿Querés suspender esta cuenta? El estudiante no podrá volver a ingresar.';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setChangingAccountStatus(true);
    setAccountStatusError('');

    try {
      const res = await cambiarEstadoEstudianteAdmin(
        userId,
        nextStatus
      );

      const updatedStatus =
        res?.data?.activo ?? nextStatus;

      setProfile((previousProfile) => ({
        ...previousProfile,
        user: {
          ...previousProfile.user,
          activo: updatedStatus,
        },
      }));
    } catch (err) {
      setAccountStatusError(
        err.message ||
          'No se pudo modificar el estado de la cuenta.'
      );
    } finally {
      setChangingAccountStatus(false);
    }
  };

  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;

    setDeletingPost(true);
    try {
      await deletePost(postToDelete.id);
      setProfile((prev) => ({
        ...prev,
        publications: prev.publications.filter((post) => post.id !== postToDelete.id),
      }));
      setPostToDelete(null);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la publicación.');
    } finally {
      setDeletingPost(false);
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

  if (!isOwnProfile && profile.privado) {
    return (
      <div className={styles.container}>
        <div className={styles.privateProfile}>
          <Avatar
            initials={profile.user.initials}
            src={profile.user.foto_url}
            size="xl"
          />
          <h1 className={styles.privateName}>{profile.user.name}</h1>
          <p className={styles.privateMessage}>
            <Lock size={16} />
            Este perfil es privado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProfileHeader
        user={profile.user}
        isAdminView={isAdmin && !isOwnProfile}
        onToggleAccountStatus={
          isAdmin && !isOwnProfile
            ? handleToggleAccountStatus
            : null
        }
        changingAccountStatus={changingAccountStatus}
        onEditProfile={isOwnProfile ? handleEditProfile : null}
        onToggleVisibility={isOwnProfile ? handleToggleVisibility : null}
        onToggleEmail={isOwnProfile ? handleToggleEmail : null}
        onUploadAvatar={isOwnProfile ? handleUploadAvatar : null}
        onDeleteAvatar={isOwnProfile ? handleDeleteAvatar : null}
        onUploadBanner={isOwnProfile ? handleUploadBanner : null}
        onDeleteBanner={isOwnProfile ? handleDeleteBanner : null}
      />

      {accountStatusError && (
        <p className={styles.accountStatusError}>
          {accountStatusError}
        </p>
      )}

      <ContactList
        contacts={profile.contacts}
        contactsCount={profile.user.contactsCount}
        estudianteId={isOwnProfile ? ownId : userId}
        onAddContact={isOwnProfile ? () => setSearchModalOpen(true) : null}
      />

      {isOwnProfile && <PendingRequests requests={profile.pendingRequests} />}

      {profile.user.bio && (
        <section className={styles.aboutCard}>
          <h2>Acerca de</h2>
          <p>{profile.user.bio}</p>
        </section>
      )}

      <PublicationsList
        publications={profile.publications.map((publication) => ({
          ...publication,
          authorImage: profile.user.foto_url,
        }))}
        userReactions={profile.userReactions}
        currentUserId={ownId}
        onLike={(id) => handleVote(id, 'like')}
        onDislike={(id) => handleVote(id, 'dislike')}
        onDelete={isOwnProfile ? (id) => setPostToDelete(profile.publications.find((post) => post.id === id)) : null}
      />

      {isOwnProfile && (
        <UserSearchModal
          open={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
        />
      )}

      <ModalConfirmation
        open={!!postToDelete}
        title="Eliminar publicación"
        message="¿Querés eliminar esta publicación? Esta acción no se puede deshacer."
        confirmText={deletingPost ? 'Eliminando...' : 'Eliminar'}
        onConfirm={handleConfirmDeletePost}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
}

export default Profile;
