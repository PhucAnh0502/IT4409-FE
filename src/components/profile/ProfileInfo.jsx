import React from "react";

const ProfileInfo = ({ fullname, userName, friendsCount, friends }) => {
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
          {friends.slice(0, 5).map((friend, index) => (
            <div key={friend.id || index} className="flex flex-col items-center gap-1">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full border-2 border-base-100">
                  <img 
                    src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${friend.fullName || friend.userName}&background=random`} 
                    alt={friend.fullName || friend.userName}
                    className="rounded-full"
                  />
                </div>
              </div>
              <span className="text-xs text-base-content/70 truncate max-w-[48px]">
                {friend.userName || friend.fullName}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
