import ProfileHeader from '../../components/profile/ProfileHeader';
import ContactList from '../../components/profile/ContactList';
import PendingRequests from '../../components/profile/PendingRequests';
import PublicationsList from '../../components/profile/PublicationsList';
import { useState } from 'react';

import {
  userData,
  contacts,
  pendingRequests,
  publications,
} from './profile/profileData';

import styles from './Profile.module.css';

function Profile({
  contactList = contacts,
  posts = publications,
  onViewAllContacts,
  onToggleVisibility,
  onLike,
  onComment,
}) {
  const [currentUser, setCurrentUser] = useState(userData);

  const handleEditProfile = (data) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className={styles.container}>
      <ProfileHeader
        user={currentUser}
        onEditProfile={handleEditProfile}
        onToggleVisibility={onToggleVisibility}
      />

      <ContactList contacts={contactList} onViewAll={onViewAllContacts} />

      <PendingRequests requests={pendingRequests} />

      <section className={styles.aboutCard}>
        <h2>Acerca de</h2>
        <p>{currentUser.bio}</p>
      </section>

      <PublicationsList
        publications={posts}
        onLike={onLike}
        onComment={onComment}
      />
    </div>
  );
}

export default Profile;