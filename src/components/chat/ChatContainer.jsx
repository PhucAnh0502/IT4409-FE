import React, { useEffect, useRef, useLayoutEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useConversationStore } from "../../stores/useConversationStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { formatMessageTimestamp, getUserIdFromToken } from "../../lib/utils";
import MessageSkeleton from "../skeletons/MessageSkeleton";

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Today";
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  }
};

const DateSeparator = ({ date }) => {
  return (
    <div className="flex justify-center my-4 opacity-70">
      <span className="text-xs font-medium bg-base-300 text-base-content px-3 py-1 rounded-full shadow-sm">
        {formatDateLabel(date)}
      </span>
    </div>
  );
};

const ChatContainer = ({ conversationId = null, onClose = () => {} }) => {
  const {
    messages,
    getMessages,
    loadMoreMessages,
    isMessagesLoading,
    isLoadingMore,
    hasMore,
  } = useConversationStore();

  const { authUser } = useAuthStore();
  const userId = getUserIdFromToken() || authUser?.id;

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
    if (!container || !messages || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.senderId === userId;

    if (!isLoadingMore && (isMyMessage || messages.length <= 20)) {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, userId, isMessagesLoading, isLoadingMore]);

  useLayoutEffect(() => {
    if (isLoadingMore || isMessagesLoading) return;

    if (prevScrollHeightRef.current > 0 && containerRef.current) {
      const container = containerRef.current;
      const heightDifference =
        container.scrollHeight - prevScrollHeightRef.current;

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
    return <MessageSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100">
      <ChatHeader close={onClose} message={messages?.[0] || null} />

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

        {messages && messages.length > 0 ? (
          messages.map((message, index) => {
            if (!message) return null;
            
            const isMe = message.senderId === userId;
            
            const currentMessageDate = message.createdAt;
            const prevMessageDate =
              index > 0 ? messages[index - 1]?.createdAt : null;

            const showDateSeparator =
              !prevMessageDate ||
              !isSameDay(currentMessageDate, prevMessageDate);

            return (
              <React.Fragment key={message.id || `msg-${index}`}>
                {showDateSeparator && (
                  <DateSeparator date={currentMessageDate} />
                )}

                <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img
                        src={
                          isMe
                            ? message.senderAvatarUrl || "/default-avatar.png"
                            : message.receiverAvatarUrl || "/default-avatar.png"
                        }
                        alt="avatar"
                      />
                    </div>
                  </div>
                  <div
                    className={`chat-bubble flex flex-col ${
                      isMe ? "chat-bubble-primary" : "chat-bubble-secondary"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    <p>{message.content}</p>
                  </div>
                  <div className="chat-footer mb-1">
                    <span className="text-xs opacity-50 ml-1">
                      {formatMessageTimestamp(message.createdAt)}
                    </span>
                  </div>
                </div>
              </React.Fragment>
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