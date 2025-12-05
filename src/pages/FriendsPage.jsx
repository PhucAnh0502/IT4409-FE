import React, { useState } from 'react';
import RequestsSidebarWrapper from '../components/friends/requestspage/RequestsSidebarWrapper';
import MainContent from '../components/friends/MainContent';
import AddFriendPage from '../components/friends/addfriendpage/AddFriendPage';

const FriendsPage = () => {
  const [currentPage, setCurrentPage] = useState('requests');

  const handleNavigate = (page) => {
    if (page === 'requests' || page === 'add_friend') {
      setCurrentPage(page);
    }
  };

  // Render Add Friend Page
  if (currentPage === 'add_friend') {
    return <AddFriendPage onNavigate={handleNavigate} />;
  }

  // Render Default Friend Requests Layout
  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Left Sidebar - Fixed width */}
      <div className="w-[360px] flex-shrink-0 h-screen sticky top-0 bg-base-100 border-r border-base-300 hidden md:block z-10 shadow-[4px_0_24px_rgba(0,0,0,0.15)] md:shadow-none">
        <RequestsSidebarWrapper onNavigate={handleNavigate} />
      </div>
      
      {/* Right Content - Flexible width */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden">
        <MainContent 
          iconType="users"
          message="Select a person's name to preview their profile."
        />
      </div>
    </div>
  );
};

export default FriendsPage;
