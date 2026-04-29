import ProfileHeader from '../../components/profile/ProfileHeader';
import ContactList from '../../components/profile/ContactList';
import PendingRequests from '../../components/profile/PendingRequests';
import PublicationsList from '../../components/profile/PublicationsList';

import { userData, contacts, pendingRequests, bio, publications } from './profile/profileData';

import styles from './Profile.module.css';
import Card from '../../components/common/Card';

function Profile({
  user = userData,
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
  return (
    <div className={styles.container}>
      <ProfileHeader 
        user={user}
        onEditProfile={onEditProfile}
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
        <p>{bio}</p>
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