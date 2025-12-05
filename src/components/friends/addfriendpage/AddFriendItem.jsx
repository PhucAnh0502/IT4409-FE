import React from 'react';

const AddFriendItem = ({ 
  id,
  name, 
  avatarUrl, 
  mutualFriends,
  followers, // New prop for follower count
  onCancelRequest
}) => {
  // Determine what info to show
  const getSubInfo = () => {
    if (mutualFriends && mutualFriends > 0) {
      return `${mutualFriends} mutual friend${mutualFriends > 1 ? 's' : ''}`;
    }
    if (followers) {
      // Format large numbers (e.g., 13000 => 13K)
      if (followers >= 1000) {
        const k = Math.floor(followers / 100) / 10;
        return `Has ${k}K followers`;
      }
      return `Has ${followers} followers`;
    }
    return '';
  };

  return (
    <div className="flex gap-3 p-2 hover:bg-base-200 rounded-lg transition-colors items-center">
      {/* Avatar */}
      <div className="w-[60px] h-[60px] flex-shrink-0">
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full rounded-full object-cover border border-base-300"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[17px] font-semibold text-base-content leading-snug">{name}</h3>
        {getSubInfo() && (
          <p className="text-[13px] text-base-content/60 truncate">
            {getSubInfo()}
          </p>
        )}
      </div>

      {/* Cancel Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onCancelRequest(id); }}
        className="bg-base-300 hover:bg-base-content/20 text-base-content text-[15px] font-medium px-4 py-2 rounded-[6px] transition-colors whitespace-nowrap"
      >
        Cancel request
      </button>
    </div>
  );
};

export default AddFriendItem;
