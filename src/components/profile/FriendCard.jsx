import React from "react";

const FriendCard = ({ friend, size = "small" }) => {
  const avatarSize = size === "large" ? "w-24 h-24" : "w-20 h-20";
  const padding = size === "large" ? "p-4" : "p-3";
  const marginBottom = size === "large" ? "mb-3" : "mb-2";
  
  return (
    <div className={`bg-base-200 rounded-lg ${padding} hover:bg-base-300 transition-all cursor-pointer group text-center flex flex-col items-center justify-center`}>
      <div className={`avatar ${marginBottom} flex justify-center`}>
        <div className={`${avatarSize} rounded-full`}>
          <img src={friend.avatarUrl} alt={friend.fullname} className="rounded-full" />
        </div>
      </div>
      <h3 className="font-semibold text-sm text-base-content group-hover:text-primary transition-colors truncate w-full">
        {friend.fullname}
      </h3>
      <p className="text-xs text-base-content/60 mt-1">
        {friend.mutualFriends} mutual friends
      </p>
    </div>
  );
};

export default FriendCard;
