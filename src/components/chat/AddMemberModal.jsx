import React, { useState, useEffect, useMemo } from "react";
import { X, Search, Check, UserX } from "lucide-react";
import { useFriendStore } from "../../stores/useFriendStore";

const AddMemberModal = ({
  isOpen,
  onClose,
  existingMemberIds,
  onAddMembers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const { friends, getFriendsList, isLoadingFriends } = useFriendStore();

  useEffect(() => {
    if (isOpen) {
      getFriendsList();
      setSelectedUserIds([]);
      setSearchTerm("");
    }
  }, [isOpen, getFriendsList]);

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (selectedUserIds.length === 0) return;
    onAddMembers(selectedUserIds);
    onClose();
  };

  const filteredFriends = useMemo(() => {
    if (!friends) return [];
    return friends.filter((friend) => {
      if (existingMemberIds.includes(friend.friendUserId)) return false;

      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        const usernameMatch = (friend.friendUserName || "")
          .toLowerCase()
          .includes(lowerTerm);
        return usernameMatch;
      }

      return true;
    });
  }, [friends, existingMemberIds, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200">
          <h3 className="font-bold text-lg">Add Friends to Group</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
              size={18}
            />
            <input
              type="text"
              placeholder="Search friends..."
              className="input input-bordered w-full pl-10 focus:outline-none focus:ring-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Friend List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingFriends ? (
            <div className="text-center py-8 text-base-content/50">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((user) => {
              const isSelected = selectedUserIds.includes(user.friendUserId);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleSelectUser(user.friendUserId)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-base-200 border-transparent"
                  }`}
                >
                  <div className="avatar">
                    <div className="w-10 rounded-full border border-base-300">
                      <img
                        src={user.friendAvatarUrl || "/default-avatar.png"}
                        alt="avt"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {user.friendUserName}
                    </h4>
                  </div>
                  {isSelected && (
                    <div className="bg-primary text-white rounded-full p-1">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-base-content/50 text-sm gap-2">
              <UserX size={32} className="opacity-20" />
              {searchTerm
                ? "No friends found matching your search."
                : "No friends available to add."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 bg-base-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedUserIds.length === 0}
            className="btn btn-primary"
          >
            Add Selected ({selectedUserIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
