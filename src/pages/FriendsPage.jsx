import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RequestsSidebarWrapper from '../components/friends/requestspage/RequestsSidebarWrapper';
import MainContent from '../components/friends/MainContent';
import AddFriendPage from '../components/friends/addfriendpage/AddFriendPage';
import UserProfilePreview from '../components/friends/UserProfilePreview';

const FriendsPage = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('requests');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Check if there's a selectedUser from navigation state
  useEffect(() => {
    if (location.state?.selectedUser) {
      setSelectedUser(location.state.selectedUser);
    }
  }, [location.state]);

  const handleNavigate = (page) => {
    if (page === 'requests' || page === 'add_friend') {
      setCurrentPage(page);
      setSelectedUser(null); // Reset selected user when navigating
    }
  };

  const handleUserSelect = (userData) => {
    setSelectedUser(userData);
  };

  // Render Add Friend Page
  if (currentPage === 'add_friend') {
    return <AddFriendPage onNavigate={handleNavigate} />;
  }

  // Render Default Friend Requests Layout
  return (
    <div className="flex min-h-screen bg-base-200 pt-16">
      {/* Left Sidebar - Fixed width */}
      <div className="w-[360px] flex-shrink-0 h-screen sticky top-0 bg-base-100 border-r border-base-300 hidden md:block z-10 shadow-[4px_0_24px_rgba(0,0,0,0.15)] md:shadow-none">
        <RequestsSidebarWrapper 
          onNavigate={handleNavigate} 
          onUserSelect={handleUserSelect}
          selectedItemId={selectedUser?.id}
        />
      </div>
      
      {/* Right Content - Flexible width */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden">
        {selectedUser ? (
          <UserProfilePreview 
            userData={selectedUser}
            statusText="Friend Request Received"
          />
        ) : (
          <MainContent 
            iconType="users"
            message="Select a person's name to preview their profile."
          />
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
