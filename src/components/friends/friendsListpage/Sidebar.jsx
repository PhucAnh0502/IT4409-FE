import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import FriendListItem from './FriendListItem';
import ContextMenu from './ContextMenu';
import { useFriendStore } from '../../../stores/useFriendStore';
import { mapFriendsArray } from '../../../lib/friendDataMapper';

const Sidebar = ({ onBack, onFriendSelect, selectedFriendId }) => {
  const { friends, getFriendsList, isLoadingFriends } = useFriendStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedFriends, setDisplayedFriends] = useState([]);
  const [mappedFriends, setMappedFriends] = useState([]);
  
  // State to manage which menu is open and where
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(undefined);

  // Fetch friends on component mount
  useEffect(() => {
    getFriendsList();
  }, []);

  // Map API friends to component format when friends data changes
  useEffect(() => {
    if (friends && friends.length > 0) {
      const mapped = mapFriendsArray(friends);
      setMappedFriends(mapped);
      setDisplayedFriends(mapped);
    } else {
      setMappedFriends([]);
      setDisplayedFriends([]);
    }
  }, [friends]);

  // Debounce search with mapped friends
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setDisplayedFriends(mappedFriends);
      } else {
        const lower = searchQuery.toLowerCase();
        setDisplayedFriends(
          mappedFriends.filter(f => 
            (f.name || '').toLowerCase().includes(lower)
          )
        );
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, mappedFriends]);

  const handleMenuClick = (event, id) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
        top: rect.bottom, 
        left: rect.left
    });
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="w-full h-screen bg-base-100 shadow-sm flex flex-col relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 pb-2">
        <button 
          onClick={onBack}
          className="hover:bg-base-200 p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-base-content/60" />
        </button>
        <div>
            <span 
              onClick={onBack}
              className="text-[13px] text-base-content/60 block cursor-pointer hover:underline"
            >
              Friends
            </span>
            <h1 className="text-2xl font-bold text-base-content leading-tight">All Friends</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2">
        <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Friends"
              className="w-full bg-base-200 text-[15px] rounded-full py-[8px] pl-9 pr-4 outline-none focus:ring-0 text-base-content placeholder-base-content/50"
            />
        </div>
      </div>

      <div className="px-4 py-3">
        <h2 className="text-[20px] font-bold text-base-content">
          {displayedFriends.length} friends
        </h2>
      </div>

      {/* Friend List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {isLoadingFriends ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-base-content/60 mt-4">Loading friends...</p>
          </div>
        ) : displayedFriends.length > 0 ? (
          /* Friends List */
          <div className="flex flex-col gap-1">
            {displayedFriends.map(friend => (
              <div key={friend.id} className="relative">
                  <FriendListItem 
                      friend={friend}
                      isSelected={friend.userId === selectedFriendId}
                      onClick={() => onFriendSelect && onFriendSelect(friend.userId)}
                      onMenuClick={handleMenuClick}
                  />
                  {/* Render Context Menu if active */}
                  {activeMenuId === friend.id && menuPosition && (
                      <ContextMenu 
                          friendName={friend.name}
                          friendUserId={friend.userId}
                          onClose={() => setActiveMenuId(null)}
                          style={{
                              top: menuPosition.top,
                              left: menuPosition.left,
                          }}
                      />
                  )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center text-base-content/60 py-4">
            {searchQuery ? 'No friends found.' : 'You have no friends yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
