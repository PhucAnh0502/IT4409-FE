import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import ImageModal from "./ImageModal";
import { useConversationStore } from "../../stores/useConversationStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { formatMessageTimestamp, getUserIdFromToken } from "../../lib/utils";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { FileText, Download } from "lucide-react"; 

// --- HELPER FUNCTIONS ---
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

const isImageFile = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
};

const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  else if (isSameDay(date, yesterday)) return "Yesterday";
  else return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
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

const ChatContainer = ({ conversationId = null, onClose = () => {}, onToggleRightSidebar }) => {
  const { messages, getMessages, loadMoreMessages, isMessagesLoading, isLoadingMore, hasMore } = useConversationStore();
  const { authUser } = useAuthStore();
  const userId = getUserIdFromToken() || authUser?.id;

  const messageEndRef = useRef(null);
  const containerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  
  const [lightbox, setLightbox] = useState({
      isOpen: false,
      images: [],     
      currentIndex: 0 
  });

  useEffect(() => {
    if (conversationId) getMessages(conversationId);
  }, [conversationId, getMessages]);

  useEffect(() => {
    if (isMessagesLoading) return;
    const container = containerRef.current;
    if (!container || !messages || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.senderId === userId;
    if (!isLoadingMore && (isMyMessage || messages.length <= 20)) {
      setTimeout(() => { messageEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100);
    }
  }, [messages, userId, isMessagesLoading, isLoadingMore]);

  useLayoutEffect(() => {
    if (isLoadingMore || isMessagesLoading) return;
    if (prevScrollHeightRef.current > 0 && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMore, isMessagesLoading]);

  // --- LOGIC LIGHTBOX ---
  const openLightbox = (images, index) => {
      setLightbox({ isOpen: true, images: images, currentIndex: index });
  };

  const closeLightbox = () => {
      setLightbox({ isOpen: false, images: [], currentIndex: 0 });
  };

  const handleNextImage = (e) => {
      if(e) e.stopPropagation();
      setLightbox((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.images.length
      }));
  };

  const handlePrevImage = (e) => {
      if(e) e.stopPropagation();
      setLightbox((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
      }));
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    if (container.scrollTop === 0 && !isLoadingMore && hasMore) {
      prevScrollHeightRef.current = container.scrollHeight;
      loadMoreMessages(conversationId);
    }
  };

  if (isMessagesLoading) return <MessageSkeleton />;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-base-100 relative">
      {/* HEADER */}
      <ChatHeader 
        close={onClose} 
        message={messages?.[0] || null} 
        conversationId={conversationId} 
        toggleSidebar={onToggleRightSidebar}
      />

      {/* MESSAGE LIST */}
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {isLoadingMore && (
          <div className="text-center py-2"><span className="loading loading-spinner loading-sm text-primary"></span></div>
        )}

        {messages && messages.length > 0 ? (
          messages.map((message, index) => {
            if (!message) return null;
            const isMe = message.senderId === userId;
            const currentMessageDate = message.createdAt;
            const prevMessageDate = index > 0 ? messages[index - 1]?.createdAt : null;
            const showDateSeparator = !prevMessageDate || !isSameDay(currentMessageDate, prevMessageDate);

            const mediaUrls = message.mediaUrls || [];
            const images = mediaUrls.filter(url => isImageFile(url));
            const files = mediaUrls.filter(url => !isImageFile(url));

            if (message.isSystemMessage || message.messageType === 99 || message.type === 99) {
                return (
                    <div key={message.id || `sys-${index}`} className="flex justify-center my-4 opacity-70">
                        <span className="text-xs bg-base-200 text-base-content px-3 py-1 rounded-full text-center">
                            {message.content}
                        </span>
                    </div>
                );
            }

            return (
              <React.Fragment key={message.id || `msg-${index}`}>
                {showDateSeparator && <DateSeparator date={currentMessageDate} />}

                <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border">
                      <img src={isMe ? message.senderAvatarUrl || "/default-avatar.png" : message.receiverAvatarUrl || message.senderAvatarUrl || "/default-avatar.png"} alt="avatar" />
                    </div>
                  </div>
                  
                  <div className={`chat-bubble flex flex-col p-3 ${isMe ? "chat-bubble-primary" : "chat-bubble-secondary"} ${images.length > 0 ? "max-w-[80%] sm:max-w-[600px]" : ""}`}>
                    
                    {/* --- 1. RENDER ẢNH GRID --- */}
                    {images.length > 0 && (
                        <div className={`grid gap-1 mb-2 ${
                            images.length === 1 ? 'grid-cols-1' : 
                            images.length === 2 ? 'grid-cols-2' : 
                            'grid-cols-3'
                        }`}>
                            {images.map((url, idx) => (
                                <div 
                                    key={`img-${idx}`} 
                                    onClick={() => openLightbox(images, idx)}
                                    className="relative group cursor-pointer overflow-hidden rounded-md border border-base-content/10 hover:brightness-90 transition-all"
                                >
                                    <img 
                                        src={url} 
                                        alt="Attachment" 
                                        className={`object-cover w-full h-full ${
                                            images.length === 1 ? 'max-h-[300px]' : 'aspect-square'
                                        }`} 
                                        loading="lazy" 
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- 2. RENDER FILE LIST --- */}
                    {files.length > 0 && (
                        <div className="flex flex-col gap-2 mb-2">
                            {files.map((url, idx) => {
                                const fileName = url.split('/').pop() || "Attached File";
                                return (
                                    <a key={`file-${idx}`} href={url} download target="_blank" rel="noopener noreferrer" 
                                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors border border-transparent ${
                                          isMe ? "bg-primary-content/10 hover:bg-primary-content/20 text-primary-content" : "bg-base-100 hover:bg-base-200 text-base-content border-base-300"
                                      }`}>
                                        <div className="p-2 bg-base-100 rounded-full text-primary shrink-0"><FileText size={20} /></div>
                                        <div className="flex flex-col overflow-hidden min-w-0">
                                            <span className="text-sm font-medium truncate max-w-[150px]">{fileName}</span>
                                            <span className="text-xs opacity-70 flex items-center gap-1">Download <Download size={10}/></span>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {message.content && <p className="break-words leading-relaxed">{message.content}</p>}
                  </div>
                  <div className="chat-footer mb-1">
                    <span className="text-xs opacity-50 ml-1">{formatMessageTimestamp(message.createdAt)}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="text-center mt-10 text-gray-500">Chưa có tin nhắn nào.</div>
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput conversationId={conversationId} />

      {/* --- IMAGE MODAL COMPONENT --- */}
      <ImageModal 
        isOpen={lightbox.isOpen}
        images={lightbox.images}
        currentIndex={lightbox.currentIndex}
        onClose={closeLightbox}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  );
};

export default ChatContainer;