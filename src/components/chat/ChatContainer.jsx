import React, { useEffect, useRef, useLayoutEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useConversationStore } from "../../stores/useConversationStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { formatMessageTimestamp, getUserIdFromToken } from "../../lib/utils";
import MessageSkeleton from "../skeletons/MessageSkeleton";

const ChatContainer = ({ conversationId = null, onClose = () => {} }) => {
  const { 
    messages, 
    getMessages,      
    loadMoreMessages, 
    isMessagesLoading,
    isLoadingMore,    
    hasMore          
  } = useConversationStore();

  const { authUser } = useAuthStore();
  const userId = getUserIdFromToken(authUser);
  
  const messageEndRef = useRef(null);       
  const containerRef = useRef(null);       
  const prevScrollHeightRef = useRef(0);   

  useEffect(() => {
    if (conversationId) {
      getMessages(conversationId);
    }
  }, [conversationId, getMessages]);

  useEffect(() => {
    if (isMessagesLoading) return; 
    
    const container = containerRef.current;
    if (!container || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.senderId === userId;

    if (!isLoadingMore && (isMyMessage || messages.length <= 20)) {
        setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }
  }, [messages, authUser.id, isMessagesLoading, isLoadingMore]);

  useLayoutEffect(() => {
    if (isLoadingMore || isMessagesLoading) return; 

    if (prevScrollHeightRef.current > 0 && containerRef.current) {
        const container = containerRef.current;
        const heightDifference = container.scrollHeight - prevScrollHeightRef.current;
        
        container.scrollTop = heightDifference;
        
        prevScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMore, isMessagesLoading]);


  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && !isLoadingMore && hasMore) {
        prevScrollHeightRef.current = container.scrollHeight;
        
        loadMoreMessages(conversationId);
    }
  };

  if (isMessagesLoading) {
    return (
      <MessageSkeleton />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <ChatHeader close={onClose} />

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      >
        {isLoadingMore && (
            <div className="text-center py-2">
                <span className="loading loading-spinner loading-sm text-primary"></span>
            </div>
        )}

        {messages.length > 0 ? (
          messages.map((message) => {
            const isMe = message.senderId === userId;
            return (
              <div key={message.id} className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={isMe ? (authUser.avatarUrl || "/default-avatar.png") : (message.senderAvatarUrl || "/default-avatar.png")}
                      alt="avatar"
                    />
                  </div>
                </div>
                <div className={`chat-bubble flex flex-col ${isMe ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                  {message.image && (
                    <img src={message.image} alt="Attachment" className="sm:max-w-[200px] rounded-md mb-2" />
                  )}
                  <p>{message.content}</p>
                </div>
                <div className="chat-footer mb-1">
                  <span className="text-xs opacity-50 ml-1">
                    {formatMessageTimestamp(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center mt-10 text-gray-500">
            Chưa có tin nhắn nào.
          </div>
        )}
        
        <div ref={messageEndRef} />
      </div>

      <MessageInput conversationId={conversationId} />
    </div>
  );
};

export default ChatContainer;