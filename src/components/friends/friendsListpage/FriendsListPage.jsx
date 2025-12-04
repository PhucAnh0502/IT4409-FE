import React, { useState } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const FriendsListPage = ({ onNavigate }) => {
  // State for friend profile preview
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  const { getUserById } = useUserStore();

  // Handle friend selection
  const handleFriendSelect = async (friendUserId) => {
    setSelectedFriendId(friendUserId);
    setIsLoadingProfile(true);
    
    try {
      const profile = await getUserById(friendUserId);
      setFriendProfile(profile);
    } catch (error) {
      console.error('Failed to load friend profile:', error);
      toast.error("Failed to load friend's profile");
      setFriendProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Left Sidebar - Fixed width */}
      <div className="w-[360px] flex-shrink-0 h-screen sticky top-0 bg-base-100 border-r border-base-300 hidden md:block z-10 shadow-[4px_0_24px_rgba(0,0,0,0.15)] md:shadow-none">
        <Sidebar 
          onBack={() => onNavigate('home')}
          onFriendSelect={handleFriendSelect}
          selectedFriendId={selectedFriendId}
        />
      </div>
      
      {/* Right Content - Flexible width */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden">
        <MainContent 
          friendProfile={friendProfile}
          isLoading={isLoadingProfile}
        />
      </div>
    </div>
  );
};

export default FriendsListPage;
