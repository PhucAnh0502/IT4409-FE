import React from 'react';
import FriendProfilePreview from './FriendProfilePreview';

const MainContent = ({ friendProfile, isLoading }) => {
  return <FriendProfilePreview profile={friendProfile} isLoading={isLoading} />;
};

export default MainContent;
