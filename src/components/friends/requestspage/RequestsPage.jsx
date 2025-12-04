import React from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const RequestsPage = ({ onNavigate }) => {
  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Left Sidebar - Fixed width */}
      <div className="w-[360px] flex-shrink-0 h-screen sticky top-0 bg-base-100 border-r border-base-300 hidden md:block z-10 shadow-[4px_0_24px_rgba(0,0,0,0.15)] md:shadow-none">
        <Sidebar onBack={() => onNavigate('home')} />
      </div>
      
      {/* Right Content - Flexible width */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden">
        <MainContent />
      </div>
    </div>
  );
};

export default RequestsPage;
