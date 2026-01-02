import React, { useMemo, useState, useEffect } from "react";
import { X, Users, MessageSquare, CheckCircle, Circle, Camera } from "lucide-react";
import { useConversationStore } from "../../stores/useConversationStore";

const FriendModal = ({
  open,
  onClose,
  friends = [],
  isLoading = false,
  onSelectFriend,
  onCreateGroup,
}) => {
  const { uploadFile } = useConversationStore();
  const [activeTab, setActiveTab] = useState("conversation");
  const [query, setQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupAvatarFile, setGroupAvatarFile] = useState(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setQuery("");
      setGroupName("");
      setGroupAvatarFile(null);
      setGroupAvatarPreview("");
      setIsUploadingAvatar(false);
      setSelectedFriends([]);
      setActiveTab("conversation");
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return (friends || []).filter((f) =>
      (f.friendUserName || "").toLowerCase().includes(q)
    );
  }, [friends, query]);

  const toggleFriendSelection = (friend) => {
    setSelectedFriends((prev) =>
      prev.some((f) => f.friendshipId === friend.friendshipId)
        ? prev.filter((f) => f.friendshipId !== friend.friendshipId)
        : [...prev, friend]
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGroupAvatarFile(file);
    setGroupAvatarPreview(URL.createObjectURL(file));
  };

  const handleCreateGroupSubmit = async () => {
    if (!groupName.trim() || !groupAvatarFile || selectedFriends.length === 0) return;
    try {
      setIsUploadingAvatar(true);
      const avatarUrl = await uploadFile(groupAvatarFile);
      const data = {
        groupName: groupName.trim(),
        groupAvatar: avatarUrl,
        memberIds: selectedFriends.map((f) => f.friendUserId),
      };
      if (onCreateGroup) await onCreateGroup(data);
      onClose();
    } catch (error) {
      console.error("Failed to create group", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!open && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] overflow-hidden transform transition-all duration-300 ${open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"} animate-slideInUp`}>
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-100 z-20">
          <h3 className="text-xl font-bold text-base-content">
            {activeTab === "conversation" ? "New Message" : "Create Group"}
          </h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}><X size={20} /></button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-base-200 bg-base-100 z-20">
          {["conversation", "group"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 relative transition-colors ${activeTab === tab ? "text-primary" : "text-base-content/50 hover:text-base-content"}`}
            >
              {tab === "conversation" ? <MessageSquare size={18} /> : <Users size={18} />}
              {tab === "conversation" ? "Conversation" : "Create Group"}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          
          {/* GROUP CONFIG (Chỉ hiện khi ở tab Group) */}
          {activeTab === "group" && (
            <div className="p-4 bg-base-200/30 border-b border-base-200 space-y-4">
              <div className="flex flex-col items-center gap-3">
                <label htmlFor="avatar-upload" className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full border-4 border-base-100 shadow-md overflow-hidden bg-base-300 flex items-center justify-center">
                    {groupAvatarPreview ? (
                      <img src={groupAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={32} className="text-base-content/20" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                </label>
                <input id="avatar-upload" type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-bold">Group Avatar</p>
              </div>

              <div className="form-control w-full">
                <input
                  type="text"
                  placeholder="What's your group name?"
                  className="input input-bordered w-full bg-base-100 focus:input-primary"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* SEARCH & FRIEND LIST */}
          <div className="sticky top-0 bg-base-100 p-4 z-10 shadow-sm">
            <input
              type="text"
              placeholder="Search friends..."
              className="input input-sm input-bordered w-full bg-base-200/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 px-2 pb-4">
            {isLoading ? (
              <div className="flex justify-center p-10"><span className="loading loading-spinner text-primary"></span></div>
            ) : filtered.length > 0 ? (
              filtered.map((friend) => {
                const isSelected = selectedFriends.some(f => f.friendshipId === friend.friendshipId);
                return (
                  <div
                    key={friend.friendshipId}
                    onClick={() => activeTab === "conversation" ? onSelectFriend(friend) : toggleFriendSelection(friend)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${isSelected ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-base-200 border-l-4 border-transparent"}`}
                  >
                    <div className="avatar">
                      <div className="w-11 h-11 rounded-full"><img src={friend.friendAvatarUrl || "/default_avatar.jpg"} alt="avatar" /></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">{friend.friendUserName}</h4>
                      <p className="text-xs opacity-50">Friend</p>
                    </div>
                    {activeTab === "group" && (
                      <div className={isSelected ? "text-primary" : "text-base-content/20"}>
                        {isSelected ? <CheckCircle size={22} className="text-primary" /> : <Circle size={22} />}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 opacity-30 text-sm italic">No friends found</div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        {activeTab === "group" && (
          <div className="p-4 border-t border-base-200 bg-base-100">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-xs font-bold opacity-60">SELECTED: <span className="text-primary">{selectedFriends.length}</span></span>
              {selectedFriends.length > 0 && <button onClick={() => setSelectedFriends([])} className="text-xs text-error hover:underline">Clear all</button>}
            </div>
            <button
              disabled={!groupName.trim() || !groupAvatarFile || selectedFriends.length < 1 || isUploadingAvatar}
              onClick={handleCreateGroupSubmit}
              className="btn btn-primary w-full shadow-lg"
            >
              {isUploadingAvatar ? <span className="loading loading-spinner"></span> : `Create Group`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendModal;