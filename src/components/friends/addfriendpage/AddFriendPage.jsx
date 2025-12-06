import React, { useState } from 'react';
import AddFriendSidebarWrapper from './AddFriendSidebarWrapper';
import MainContent from '../MainContent';
import UserProfilePreview from '../UserProfilePreview';

const AddFriendPage = ({ onNavigate }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = (userData) => {
    setSelectedUser(userData);
  };

  return (
    <div className="flex min-h-screen bg-base-200 pt-16">
      {/* Left Sidebar - Fixed width */}
      <div className="w-[360px] flex-shrink-0 h-screen sticky top-0 bg-base-100 border-r border-base-300 hidden md:block z-10 shadow-[4px_0_24px_rgba(0,0,0,0.15)] md:shadow-none">
        <AddFriendSidebarWrapper 
          onBack={() => onNavigate('requests')} 
          onUserSelect={handleUserSelect}
          selectedItemId={selectedUser?.id}
        />
      </div>
      
      {/* Right Content - Flexible width */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden">
        {selectedUser ? (
          <UserProfilePreview 
            userData={selectedUser}
            statusText="Friend Request Sent · Waiting for response"
          />
        ) : (
          <MainContent 
            iconType="group"
            message="Select someone's name to preview their profile."
          />
        )}
      </div>
    </div>
  );
};

export default AddFriendPage;
