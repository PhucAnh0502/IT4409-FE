import React from "react";
import { Users } from "lucide-react";
import FriendCard from "./FriendCard";

const AllFriendsSection = ({ friends }) => {
  return (
    <div className="bg-base-100 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          All Friends
        </h2>
        <span className="text-base-content/60">
          {friends.length} friends
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {friends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} size="large" />
        ))}
      </div>
    </div>
  );
};

export default AllFriendsSection;
