import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/chat/Sidebar.jsx";
import NoChatSelected from "../components/chat/NoChatSelected.jsx";
import ChatContainer from "../components/chat/ChatContainer.jsx";
import { useSignalRConnection } from "../contexts/SignalRContext";
import { useConversationStore } from "../stores/useConversationStore";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

const HomePage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);

  const connection = useSignalRConnection();
  const setStoreSelectedConversation = useConversationStore((s) => s.setSelectedConversation);
  const { createConversation, conversations, getConversations } = useConversationStore();

  // Handle auto-start chat from friends list
  useEffect(() => {
    const startChatWithUserId = location.state?.startChatWithUserId;
    const friendName = location.state?.friendName;
    
    if (startChatWithUserId) {
      // Clear the location state to prevent retriggering
      window.history.replaceState({}, document.title);
      
      // Try to find existing conversation or create new one
      const handleAutoCreateChat = async () => {
        try {
          // Refresh conversations first
          await getConversations();
          
          // Check if conversation already exists
          const existing = conversations?.find((conv) => {
            if (!conv) return false;
            if (conv.receiverId === startChatWithUserId || 
                conv.otherUserId === startChatWithUserId || 
                conv.friendUserId === startChatWithUserId) return true;
            
            const arrChecks = [conv.participants, conv.participantIds, conv.members, conv.users];
            for (const arr of arrChecks) {
              if (!Array.isArray(arr)) continue;
              if (arr.some((p) => {
                if (!p) return false;
                if (typeof p === 'string') return p === startChatWithUserId;
                return p.id === startChatWithUserId || p.userId === startChatWithUserId;
              })) return true;
            }
            return false;
          });

          if (existing) {
            const existingId = existing.conversationId || existing.id;
            setSelectedConversation(existingId);
          } else {
            // Create new conversation
            const newConv = await createConversation({ receiverId: startChatWithUserId });
            const newConvId = newConv?.conversationId;
            if (newConvId) {
              setSelectedConversation(newConvId);
            }
          }
        } catch (error) {
          console.error("Failed to create conversation:", error);
        }
      };

      handleAutoCreateChat();
    }
  }, [location.state]);

  useEffect(() => {
    if (!connection) return;

    const join = async (convId) => {
      try {
        if (!convId) return;
        await connection.invoke("JoinConversation", convId.toString());
      } catch {
        // ignore
      }
    };

    const leave = async (convId) => {
      try {
        if (!convId) return;
        await connection.invoke("LeaveConversation", convId.toString());
      } catch {
        // ignore
      }
    };

    if (selectedConversation) {
      join(selectedConversation);
    }

    return () => {
      if (selectedConversation) leave(selectedConversation);
    };
  }, [connection, selectedConversation]);

  useEffect(() => {
    setStoreSelectedConversation(selectedConversation);
  }, [selectedConversation, setStoreSelectedConversation]);

  return (
    <div className="h-screen bg-base-200">
      <div className="bg-base-100 w-full h-full">
        <div className="flex h-full overflow-hidden pt-16 pb-2 pl-2 pr-2">
          {/* Mobile menu button */}
          <div className="lg:hidden mr-2">
            <button
              className="btn btn-ghost btn-square"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open chats"
            >
              <Menu />
            </button>
          </div>

          {/* Sidebar for large screens */}
          <div className="hidden lg:block">
            <Sidebar
              ref={sidebarRef}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
              onSelect={(id) => setSelectedConversation(id)}
            />
          </div>

          {/* Mobile overlay sidebar */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
              <div className="relative w-80 h-full">
                <Sidebar
                  selectedConversation={selectedConversation}
                  setSelectedConversation={setSelectedConversation}
                  onSelect={(id) => {
                    setSelectedConversation(id);
                    setIsSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* Main chat area */}
          {!selectedConversation ? (
            <NoChatSelected />
          ) : (
            <ChatContainer
              conversationId={selectedConversation}
              onClose={() => setSelectedConversation(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
