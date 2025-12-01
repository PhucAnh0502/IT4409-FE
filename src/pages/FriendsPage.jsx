import React, { useState } from 'react';
import Sidebar from '../components/friends/homepage/Sidebar';
import MainContent from '../components/friends/homepage/MainContent';
import RequestsPage from '../components/friends/requestspage/RequestsPage';
import FriendsListPage from '../components/friends/friendsListpage/FriendsListPage';

const FriendsPage = () => {
  // State-based routing logic moved here
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page) => {
    if (page === 'home' || page === 'requests' || page === 'all_friends') {
      setCurrentPage(page);
    }
  };

  // Render Requests Page
  if (currentPage === 'requests') {
    return <RequestsPage onNavigate={handleNavigate} />;
  }

  // Render Friends List Page
  if (currentPage === 'all_friends') {
    return <FriendsListPage onNavigate={handleNavigate} />;
  }

  // Render Default Homepage Layout
  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Left Sidebar - Fixed width, sticky position */}
      <div className="w-[360px] flex-shrink-0 h-screen sticky top-0 bg-base-100 border-r border-base-300 hidden md:block z-10">
        <Sidebar onNavigate={handleNavigate} />
      </div>
      
      {/* Right Content - Flexible width */}
      <div className="flex-1 min-w-0">
        <MainContent onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default FriendsPage;
