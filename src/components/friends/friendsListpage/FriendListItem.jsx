import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { getFallbackAvatar } from '../../../lib/friendDataMapper';

const FriendListItem = ({ 
  id,
  name, 
  avatarUrl, 
  mutualFriends,
  onMenuClick,
  // Support API field names as well
  friend,
  // New props for selection
  isSelected = false,
  onClick
}) => {
  // Use friend object if provided, otherwise use individual props
  const friendData = friend || { id, name, avatarUrl, mutualFriends };
  
  // Get display values with fallbacks
  const displayName = friendData.name || friendData.friendUserName || 'Unknown';
  const displayAvatar = friendData.avatarUrl || friendData.friendAvatarUrl || getFallbackAvatar(displayName);
  const displayMutualFriends = friendData.mutualFriends || 0;
  const friendId = friendData.id || friendData.friendshipId;

  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center p-2 rounded-lg cursor-pointer transition-all group relative
        hover:bg-base-200
        ${isSelected ? 'bg-base-300 border-l-4 border-primary pl-[6px]' : 'border-l-4 border-transparent'}
      `}
    >
      {/* Avatar */}
      <img 
        src={displayAvatar} 
        alt={displayName} 
        className="w-[60px] h-[60px] rounded-full object-cover border border-base-300 mr-3"
        onError={(e) => {
          // Fallback to generated avatar if image fails to load
          e.target.src = getFallbackAvatar(displayName);
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-[17px] font-semibold text-base-content leading-tight">{displayName}</h3>
        <p className="text-[13px] text-base-content/60 truncate">
          {displayMutualFriends > 0 ? `${displayMutualFriends} mutual friends` : '0 mutual friends'}
        </p>
      </div>

      {/* Meatball Menu Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent onClick
          onMenuClick && onMenuClick(e, friendId);
        }}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-base-300 text-base-content/60 transition-colors focus:outline-none"
      >
        <MoreHorizontal size={24} />
      </button>
    </div>
  );
};

export default FriendListItem;
