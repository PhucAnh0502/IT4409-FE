import React from "react";

const FriendCard = ({ friend, size = "small" }) => {
  
  const avatarSize = size === "large" ? "w-20 h-20" : "w-16 h-16";
  const cardHeight = size === "large" ? "h-40" : "h-36";
  const padding = size === "large" ? "p-3" : "p-3";
  const marginBottom = size === "large" ? "mb-2" : "mb-2";
  
  const displayName = friend.fullName || friend.userName || "Unknown";
  const username = friend.userName || "unknown";
  
  // Use avatarUrl from database if available, otherwise generate fallback
  // Same logic as ProfilePage uses for user avatar
  const avatarUrl = friend.avatarUrl 
    ? friend.avatarUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
  
  
  return (
    <div className={`bg-base-200 rounded-lg ${padding} ${cardHeight} hover:bg-base-300 transition-all cursor-pointer group text-center flex flex-col items-center justify-center`}>
      <div className={`avatar ${marginBottom} flex justify-center flex-shrink-0`}>
        <div className={`${avatarSize} rounded-full`}>
          <img src={avatarUrl} alt={displayName} className="rounded-full" />
        </div>
      </div>
      <h3 className="font-semibold text-sm text-base-content group-hover:text-primary transition-colors truncate w-full px-1">
        {displayName}
      </h3>
      <p className="text-xs text-base-content/60 truncate w-full px-1">
        @{username}
      </p>
      {friend.friendedBy !== undefined && friend.friendedBy !== null && (
        <p className="text-xs text-base-content/50 truncate w-full px-1">
          {friend.friendedBy} mutual {friend.friendedBy === 1 ? 'friend' : 'friends'}
        </p>
      )}
    </div>
  );
};

export default FriendCard;
