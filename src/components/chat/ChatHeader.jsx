import React, { useMemo } from "react";
import { X, EllipsisVertical } from "lucide-react"; 
import { useConversationStore } from "../../stores/useConversationStore";

const ChatHeader = ({ close, message, toggleSidebar }) => {
  const { selectedConversation, conversations } = useConversationStore();

  const currentConversation = useMemo(() => {
    if (!selectedConversation || !conversations) return null;
    return conversations.find(
      (conv) => conv?.id === selectedConversation || conv?._id === selectedConversation
    );
  }, [selectedConversation, conversations]);

  const getConversationName = () => currentConversation?.name || "Conversation";
  const getAvatarUrl = () => currentConversation?.avatarUrl || message?.receiverAvatarUrl || "/default-avatar.png";
  const conversationName = getConversationName();


  return (
    <div className="p-2.5 border-b border-base-300 flex-shrink-0"> 
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={getAvatarUrl()} alt={conversationName} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{conversationName}</h3>
            <p className="text-sm text-base-content/70">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-1">

            <button
                className="p-2 hover:bg-base-300 rounded-full transition-colors"
                onClick={toggleSidebar}
                aria-label="Conversation info"
            >
                <EllipsisVertical className="size-5" />
            </button>

            <button
                className="p-2 hover:bg-base-300 rounded-full transition-colors"
                onClick={close}
                aria-label="Close conversation"
            >
                <X className="size-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;