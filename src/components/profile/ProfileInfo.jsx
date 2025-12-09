import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileInfo = ({ fullname, userName, friendsCount, friends }) => {
  const navigate = useNavigate();
  
  const handleFriendClick = (friend) => {
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
    <div className="flex-1 text-center md:text-left mb-4">
      <h1 className="text-3xl font-bold text-base-content">
        {fullname}
      </h1>
      <p className="text-base-content/60 mt-1">
        {friendsCount} friends
      </p>
      
      {/* Friend avatars preview */}
      {friends && friends.length > 0 && (
        <div className="flex justify-center md:justify-start gap-3 mt-3 flex-wrap">
          {friends.slice(0, 5).map((friend, index) => {
            // Map API fields to display fields
            const displayName = friend.friendFullName || friend.friendUserName || friend.userName || 'Unknown';
            const username = friend.friendUserName || friend.userName || 'unknown';
            const avatarUrl = friend.friendAvatarUrl || friend.avatarUrl;
            
            return (
              <div 
                key={friend.friendshipId || friend.id || index} 
                className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleFriendClick(friend)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFriendClick(friend);
                  }
                }}
              >
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full border-2 border-base-100 hover:border-primary transition-colors">
                    <img 
                      src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`} 
                      alt={username}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <span className="text-xs text-base-content/70 truncate max-w-[48px] hover:text-primary transition-colors">
                  {username}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;