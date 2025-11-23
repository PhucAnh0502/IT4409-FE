import React, { useMemo, useState } from "react";
import { X } from "lucide-react";

const FriendModal = ({ open, onClose, friends = [], isLoading = false, onSelectFriend }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return friends || [];
    const q = query.toLowerCase();
    return (friends || []).filter((f) => (f.friendUserName || "").toLowerCase().includes(q));
  }, [friends, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-base-100 rounded-lg shadow-lg w-full max-w-md mx-4 z-10">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Select a friend</h3>
          <button className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Close modal">
            <X />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search friends"
              className="input input-bordered w-full bg-base-200 focus:outline-none focus:ring-1 focus:ring-primary border-none"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {isLoading && <div>Loading friends...</div>}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center text-sm text-base-content/60">No friends found</div>
            )}

            {!isLoading && filtered.map((friend) => (
              <button
                key={friend.friendshipId}
                className="w-full flex items-center gap-3 p-3 rounded hover:bg-base-200"
                onClick={() => onSelectFriend(friend)}
              >
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src={friend.friendAvatarUrl || '/default-avatar.png'} alt={friend.friendUserName} />
                  </div>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium truncate">{friend.friendUserName}</div>
                  <div className="text-xs text-base-content/60">Added {new Date(friend.createdAt).toLocaleDateString()}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendModal;
