import ProfileHeader from '../../components/profile/ProfileHeader';
import ContactList from '../../components/profile/ContactList';
import PendingRequests from '../../components/profile/PendingRequests';
import PublicationsList from '../../components/profile/PublicationsList';
import { useState } from 'react';

import { userData, contacts, pendingRequests, publications } from './profile/profileData';

import styles from './Profile.module.css';
import Card from '../../components/common/Card';

function Profile({
  contactList = contacts,
  requests = pendingRequests,
  posts = publications,
  onAcceptRequest,
  onIgnoreRequest,
  onEditProfile,
  onViewAllContacts,
  onToggleVisibility,
  onLike,
  onComment
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
      

      <ContactList 
        contacts={contactList}
        onViewAll={onViewAllContacts}
      />

      <PendingRequests 
        requests={requests}
        onAccept={onAcceptRequest}
        onIgnore={onIgnoreRequest}
      />

      <Card title={"Acerca de"}>
        <p>{currentUser.bio}</p>
      </Card>

      <PublicationsList 
        publications={posts}
        onLike={onLike}
        onComment={onComment}
      />
    </div>
  );
}

export default Profile;