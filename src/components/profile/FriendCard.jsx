import React from "react";
import { useNavigate } from "react-router-dom";

const FriendCard = ({ friend, size = "small" }) => {
  const navigate = useNavigate();
  
  const avatarSize = size === "large" ? "w-20 h-20" : "w-16 h-16";
  const cardHeight = size === "large" ? "h-40" : "h-36";
  const padding = size === "large" ? "p-3" : "p-3";
  const marginBottom = size === "large" ? "mb-2" : "mb-2";
  const username = friend.friendUserName || "unknown";
  
  // Use avatarUrl from database if available, otherwise generate fallback
  // Same logic as ProfilePage uses for user avatar
  const avatarUrl = friend.friendAvatarUrl 
    ? friend.friendAvatarUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
  
  const handleClick = () => {
    // Map friend data to UserProfilePreview expected format (receiver* prefix)
    const friendData = {
      receiverFullName: friend.friendFullName || friend.fullName || friend.friendUserName,
      receiverUserName: friend.friendUserName || friend.userName,
      receiverAvatar: friend.friendAvatarUrl || friend.avatarUrl,
      receiverEmail: friend.friendEmail || friend.email,
      receiverBio: friend.friendBio || friend.bio,
      receiverPhone: friend.friendPhone || friend.phone,
      receiverCreatedAt: friend.createdAt,
      // Note: No 'message' field, so Request Message card won't display
    };
    
    navigate('/friends', { state: { selectedUser: friendData } });
  };
  
  return (
    <div 
      onClick={handleClick}
      className={`glass rounded-lg ${padding} ${cardHeight} hover:bg-base-300/30 transition-all cursor-pointer group text-center flex flex-col items-center justify-center backdrop-blur-lg bg-base-200/60 border border-base-300/30`}
    >
      <div className={`avatar ${marginBottom} flex justify-center flex-shrink-0`}>
        <div className={`${avatarSize} rounded-full`}>
          <img src={avatarUrl} alt={username} className="rounded-full" />
        </div>
      </div>
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