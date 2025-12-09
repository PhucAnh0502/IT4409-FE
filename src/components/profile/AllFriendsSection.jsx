import React from "react";
import { Users } from "lucide-react";
import FriendCard from "./FriendCard";

const AllFriendsSection = ({ friends }) => {
  return (
    <div className="glass rounded-xl shadow-xl p-6 backdrop-blur-xl bg-base-100/70">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          All Friends
        </h2>
        <span className="text-base-content/60">
          {friends?.length || 0} friends
        </span>
      </div>

      {friends && friends.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {friends.map((friend, index) => (
            <FriendCard key={friend.id || index} friend={friend} size="large" />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <p className="text-base-content/60">No friends yet</p>
        </div>
      )}
    </div>
  );
};

export default AllFriendsSection;
