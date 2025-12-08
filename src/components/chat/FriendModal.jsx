import React, { useMemo, useState, useEffect } from "react";
import { X, Users, MessageSquare, CheckCircle, Circle } from "lucide-react";

const FriendModal = ({
  open,
  onClose,
  friends = [],
  isLoading = false,
  onSelectFriend,
  onCreateGroup,
}) => {
  const [activeTab, setActiveTab] = useState("conversation");
  const [query, setQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery("");
        setGroupName("");
        setSelectedFriends([]);
        setActiveTab("conversation");
      }, 200);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query) return friends || [];
    const q = query.toLowerCase();
    return (friends || []).filter((f) =>
      (f.friendUserName || "").toLowerCase().includes(q)
    );
  }, [friends, query]);

  const toggleFriendSelection = (friend) => {
    if (selectedFriends.some((f) => f.friendshipId === friend.friendshipId)) {
      setSelectedFriends((prev) =>
        prev.filter((f) => f.friendshipId !== friend.friendshipId)
      );
    } else {
      setSelectedFriends((prev) => [...prev, friend]);
    }
  };

  const handleCreateGroupSubmit = () => {
    if (!groupName.trim() || selectedFriends.length === 0) return;
    if (onCreateGroup) {
      const data = {
        groupName: groupName.trim(),
        memberIds: selectedFriends.map((f) => f.friendUserId),
      };
      onCreateGroup(data);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      <div className="relative bg-base-100 rounded-xl shadow-2xl w-full max-w-md mx-4 z-10 flex flex-col max-h-[90vh] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-[10%] duration-300 ease-out">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h3 className="text-lg font-bold text-base-content">
            {activeTab === "conversation" ? "New Message" : "Create Group"}
          </h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost hover:bg-base-200 hover:rotate-90 transition-transform duration-200" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-base-200">
          <button
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 relative ${
              activeTab === "conversation"
                ? "text-primary"
                : "text-base-content/60 hover:bg-base-100 hover:text-base-content"
            }`}
            onClick={() => setActiveTab("conversation")}
          >
            <MessageSquare size={18} />
            Conversation
            {activeTab === "conversation" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in zoom-in-0 duration-200" />
            )}
          </button>
          
          <button
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 relative ${
              activeTab === "group"
                ? "text-primary"
                : "text-base-content/60 hover:bg-base-100 hover:text-base-content"
            }`}
            onClick={() => setActiveTab("group")}
          >
            <Users size={18} />
            Create Group
            {activeTab === "group" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in zoom-in-0 duration-200" />
            )}
          </button>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col bg-base-100/50">
          {activeTab === "group" && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="label pt-0">
                <span className="label-text font-medium text-base-content/80">Group Name</span>
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="input input-bordered w-full focus:outline-none border-transparent focus:bg-base-100 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                autoFocus
              />
            </div>
          )}

          <div className="mb-3 relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search friends..."
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 min-h-[200px] pr-1 custom-scrollbar">
            {isLoading && <div className="text-center p-4 text-base-content/60 animate-pulse">Loading friends...</div>}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center text-sm text-base-content/60 p-8 flex flex-col items-center gap-2">
                <Users size={40} className="text-base-content/20" />
                <p>No friends found</p>
              </div>
            )}

            {!isLoading &&
              filtered.map((friend) => {
                const isSelected = selectedFriends.some(
                  (f) => f.friendshipId === friend.friendshipId
                );

                return (
                  <button
                    key={friend.friendshipId}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                      activeTab === "group" && isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-base-200 border border-transparent"
                    }`}
                    onClick={() => {
                      if (activeTab === "conversation") {
                        onSelectFriend(friend);
                      } else {
                        toggleFriendSelection(friend);
                      }
                    }}
                  >
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-base-200 group-hover:ring-primary/50 transition-all">
                        <img
                          src={friend.friendAvatarUrl || "/default-avatar.png"}
                          alt={friend.friendUserName}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="text-left flex-1 min-w-0">
                      <div className={`font-medium truncate transition-colors ${isSelected ? "text-primary" : ""}`}>
                        {friend.friendUserName}
                      </div>
                      <div className="text-xs text-base-content/50">
                        Friend
                      </div>
                    </div>

                    {activeTab === "group" && (
                      <div className={`transition-all duration-200 ${isSelected ? "text-primary scale-110" : "text-base-content/20 scale-100 group-hover:text-base-content/40"}`}>
                        {isSelected ? (
                          <CheckCircle size={22} />
                        ) : (
                          <Circle size={22} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {activeTab === "group" && (
          <div className="p-4 border-t border-base-200 bg-base-50/50 rounded-b-xl animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-base-content/70">
                Selected: <span className="text-primary font-bold">{selectedFriends.length}</span>
              </span>
            </div>
            <button
              className="btn btn-primary w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              disabled={!groupName.trim() || selectedFriends.length === 0}
              onClick={handleCreateGroupSubmit}
            >
              Create Group ({selectedFriends.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendModal;