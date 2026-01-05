import React, { useEffect, useState, useMemo } from "react";
import { Search, Plus, Shuffle } from "lucide-react"; 
import { useConversationStore } from "../../stores/useConversationStore";
import { formatMessageTimestamp } from "../../lib/utils";
import { useFriendStore } from "../../stores/useFriendStore";
import toast from "react-hot-toast";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import FriendModal from "./FriendModal";
import { useSignalRConnection } from "../../contexts/SignalRContext";
import * as signalR from "@microsoft/signalr";

const Sidebar = ({ selectedConversation, setSelectedConversation, onSelect }) => {
  const { 
    conversations, 
    getConversations, 
    isGettingConversations, 
    createConversation, 
    isCreatingConversation, 
    isCreatingGroup, 
    createGroup,
    markConversationAsRead,
    randomConversation 
  } = useConversationStore();

  const { friends, getFriendsList, isLoadingFriends } = useFriendStore();
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const connection = useSignalRConnection();

  const filteredConversations = useMemo(() => {
    let list = conversations || [];

    if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter((conv) => {
            const name = (conv?.name || conv?.conversationName || "").toString().toLowerCase();
            const last = (conv?.lastMessageContent || conv?.lastMessage || "").toString().toLowerCase();
            return name.includes(q) || last.includes(q);
        });
    }

    return [...list].sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || a.timestamp || 0).getTime();
        const timeB = new Date(b.lastMessageTime || b.timestamp || 0).getTime();
        return timeB - timeA; 
    });
}, [conversations, searchQuery]);

  useEffect(() => {
    getConversations();
  }, [getConversations]);

  // Join tất cả conversations khi load để nhận messages từ bất kỳ conversation nào
  useEffect(() => {
    if (!connection || !conversations || conversations.length === 0) return;

    const joinAllConversations = async () => {
      try {
        if (connection.state !== signalR.HubConnectionState.Connected) {
          try {
            await connection.start();
          } catch (e) {
            console.error("SignalR not connected, skip join:", e?.message);
            return;
          }
        }
        
        for (const conv of conversations) {
          const convId = conv.id || conv.conversationId || conv._id;
          if (convId) {
            try {
              await connection.invoke("JoinConversation", convId.toString());
            } catch (err) {
              console.error(`Failed to join conversation ${convId}:`, err);
            }
          }
        }
      } catch (error) {
        console.error("Error joining conversations:", error);
      }
    };

    joinAllConversations();

  }, [connection, connection?.state, conversations?.length]);

  const handleRandomChat = async () => {
    try {
      toast.loading("Finding random person...", { id: "random-chat" });
      
      const newConv = await randomConversation();
      
      const newConvId = newConv?.conversationId || newConv?.id;

      if (newConvId) {
        setSelectedConversation(newConvId);
        if (typeof onSelect === 'function') onSelect(newConvId);
        toast.success("Connected with a new friend!", { id: "random-chat" });
      } else {
        toast.error("No chat room found!", { id: "random-chat" });
      }
    } catch (error) {
      console.error("Random chat error:", error);
      toast.error("Unable to find a match right now. Please try again!", { id: "random-chat" });
    }
  };

  const openFriendModal = () => {
    setIsFriendModalOpen(true);
    getFriendsList().catch((error) => {
      toast.error(error?.error || "Failed to load friends");
    });
  };

  const handleCreateConversation = async (friend) => {
    try {
      const friendId = friend.friendUserId || friend.id || friend._id;
      
      const existing = (conversations || [])?.find((conv) => {
        if (!conv) return false;
        if (conv.receiverId === friendId || conv.otherUserId === friendId || conv.friendUserId === friendId) return true;
        const arrChecks = [conv.participants, conv.participantIds, conv.members, conv.users];
        for (const arr of arrChecks) {
          if (!Array.isArray(arr)) continue;
          if (arr.some((p) => {
            if (!p) return false;
            if (typeof p === 'string') return p === friendId;
            return p.id === friendId || p.userId === friendId || p.user?.id === friendId || p._id === friendId;
          })) return true;
        }
        return false;
      });

      if (existing) {
        const existingId = existing.conversationId || existing.id || existing._id;
        if (existingId) {
          setSelectedConversation(existingId);
          if (typeof onSelect === 'function') onSelect(existingId);
        }
        setIsFriendModalOpen(false);
        toast.success("Opened conversation");
        return existingId;
      }

      if (isCreatingConversation) return;

      const payload = { receiverId: friendId };
      const newConv = await createConversation(payload);

      const newConvId = newConv?.conversationId || newConv?.id;
      if (newConvId) {
        setSelectedConversation(newConvId);
        if (typeof onSelect === 'function') onSelect(newConvId);
      }

      setIsFriendModalOpen(false);
      toast.success("Created a new conversation");
      return newConvId;
    } catch (error) {
      toast.error(error?.error || "Failed to create conversation");
      return null;
    }
  };

  const handleCreateGroup = async (groupData) => {
    if (isCreatingGroup) return;
    try {
      const newGroup = await createGroup(groupData);
      setIsFriendModalOpen(false); 
      const newGroupId = newGroup?.conversationId || newGroup?.id;
      if (newGroupId) {
        setSelectedConversation(newGroupId);
        if (typeof onSelect === 'function') onSelect(newGroupId);
      }
    } catch (error) {
      console.error("Failed to create group in Sidebar", error);
    }
  };

  if (isGettingConversations) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="h-full w-full lg:w-80 border-r border-base-300 flex flex-col bg-base-100">
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-base-content">Chats</h1>
          
          <div className="flex items-center gap-1">
            <button
              className={`btn btn-sm btn-square btn-ghost hover:bg-base-300 rounded-lg tooltip tooltip-bottom ${isCreatingConversation ? 'loading' : ''}`}
              onClick={handleRandomChat}
              disabled={isCreatingConversation}
              data-tip="Random chat"
            >
              {!isCreatingConversation && <Shuffle className="size-5 text-primary" />}
            </button>

            <button
              className="btn btn-sm btn-square btn-ghost hover:bg-base-300 rounded-lg tooltip tooltip-bottom"
              onClick={openFriendModal}
              data-tip="New conversation"
            >
              <Plus className="size-5 text-base-content" />
            </button>
          </div>
        </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="size-5 text-base-content/50" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversation..."
            className="input input-bordered w-full pl-10 h-10 rounded-xl bg-base-200 focus:outline-none focus:ring-1 focus:ring-primary border-none"
          />
        </div>
      </div>

      <div className="overflow-y-auto w-full flex-1">
        {filteredConversations?.map((conversation) => (
          <button
            key={conversation.id || conversation.conversationId}
            className={`
              w-full p-3 flex items-center gap-3
              transition-colors hover:bg-base-200
              ${!conversation.isRead ? "bg-base-200/50" : ""} 
              ${selectedConversation == (conversation.id || conversation.conversationId) ? "bg-base-300" : ""}
            `}
            onClick={() => {
              const id = conversation.id || conversation.conversationId;
              setSelectedConversation(id);
              if (typeof onSelect === 'function') onSelect(id);
              markConversationAsRead(id);
            }}
          >
            <div className="avatar relative">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={conversation.avatarUrl || "/default_avatar.jpg"}
                  alt={conversation.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="text-left min-w-0 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-baseline">
                <span
                  title={`Username: @${conversation.username || conversation.userName || 'user'}`}
                  className={`truncate text-base ${
                    !conversation.isRead ? "font-bold" : "font-medium text-base-content"
                  }`}
                >
                  {conversation.name || conversation.conversationName || "Người lạ"}
                </span>
                <span className="text-xs text-base-content/50 ml-2 whitespace-nowrap">
                  {formatMessageTimestamp(conversation.lastMessageTime)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`truncate text-sm ${
                    !conversation.isRead
                      ? "font-bold" 
                      : "text-base-content/60" 
                  }`}
                >
                  {conversation.lastMessageContent || "Start a new conversation!"}
                </span>
                
                {!conversation.isRead && (
                  <div className="size-2.5 bg-blue-500 rounded-full ml-2 shrink-0"></div>
                )}
              </div>
            </div>
          </button>
        ))}
        
        {(!filteredConversations || filteredConversations.length === 0) && (
          <div className="text-center text-base-content/50 py-10">
            Cannot find any conversations.
          </div>
        )}
      </div>

      <FriendModal
        open={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
        friends={friends}
        isLoading={isLoadingFriends}
        onSelectFriend={handleCreateConversation}
        onCreateGroup={handleCreateGroup}
      />
    </aside>
  );
};

export default Sidebar;