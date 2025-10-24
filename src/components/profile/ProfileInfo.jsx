import React from "react";

const ProfileInfo = ({ firstName, lastName, friendsCount, friends }) => {
  return (
    <div className="flex-1 text-center md:text-left mb-4">
      <h1 className="text-3xl font-bold text-base-content">
        {firstName} {lastName}
      </h1>
      <p className="text-base-content/60 mt-1">
        {friendsCount} friends
      </p>
      
      {/* Friend avatars preview */}
      <div className="flex justify-center md:justify-start gap-1 mt-3">
        <div className="avatar-group -space-x-4">
          {friends.slice(0, 5).map((friend) => (
            <div key={friend.id} className="avatar border-2 border-base-100">
              <div className="w-8 h-8">
                <img src={friend.avatar} alt={friend.firstName} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
