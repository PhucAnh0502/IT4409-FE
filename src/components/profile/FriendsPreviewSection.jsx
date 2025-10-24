import React from "react";
import { Users } from "lucide-react";
import FriendCard from "./FriendCard";

const FriendsPreviewSection = ({ friends, onSeeAllClick }) => {
  return (
    <div className="flex">
      <div className="bg-base-100 rounded-xl shadow-md p-6 w-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Friends
          </h2>
          <span className="text-base-content/60 text-sm">
            {friends.length} friends
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 flex-1">
          {friends.slice(0, 6).map((friend) => (
            <FriendCard key={friend.id} friend={friend} size="small" />
          ))}
        </div>

        <button 
          onClick={onSeeAllClick}
          className="btn btn-outline btn-block mt-4"
        >
          See All Friends
        </button>
      </div>
    </div>
  );
};

export default FriendsPreviewSection;
