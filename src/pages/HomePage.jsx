import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/chat/Sidebar.jsx";
import NoChatSelected from "../components/chat/NoChatSelected.jsx";
import ChatContainer from "../components/chat/ChatContainer.jsx";
import ChatRightSidebar from "../components/chat/ChatRightSidebar.jsx"; // Import Sidebar phải
import { useSignalRConnection } from "../contexts/SignalRContext";
import { useConversationStore } from "../stores/useConversationStore";
import { Menu } from "lucide-react";

const HomePage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const connection = useSignalRConnection();
  const setStoreSelectedConversation = useConversationStore((s) => s.setSelectedConversation);
  const { conversations } = useConversationStore(); 

  const currentConversationData = useMemo(() => {
    if (!selectedConversation || !conversations) return null;
    return conversations.find(c => c.id === selectedConversation || c._id === selectedConversation);
  }, [selectedConversation, conversations]);

  useEffect(() => {
    if (!connection) return;

    const join = async (convId) => {
      try {
        if (!convId) return;
        await connection.invoke("JoinConversation", convId.toString());
      } catch { /* ignore */ }
    };

    const leave = async (convId) => {
      try {
        if (!convId) return;
        await connection.invoke("LeaveConversation", convId.toString());
      } catch { /* ignore */ }
    };

    if (selectedConversation) {
      join(selectedConversation);
      setIsRightSidebarOpen(false);
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
          
          {/* --- LEFT SIDEBAR (Mobile Toggle Button) --- */}
          <div className="lg:hidden mr-2">
            <button
              className="btn btn-ghost btn-square"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open chats"
            >
              <Menu />
            </button>
          </div>

          {/* --- LEFT SIDEBAR (Desktop) --- */}
          <div className="hidden lg:block h-full">
            <Sidebar
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
              onSelect={(id) => setSelectedConversation(id)}
            />
          </div>

          {/* --- LEFT SIDEBAR (Mobile Overlay) --- */}
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

          {/* --- MAIN CONTENT AREA --- */}
          {!selectedConversation ? (
            <NoChatSelected />
          ) : (
            <div className="flex-1 flex overflow-hidden relative border-l border-base-300"> 
              
              {/* KHUNG CHAT CHÍNH */}
              <div className="flex-1 min-w-0 flex flex-col h-full">
                <ChatContainer
                  conversationId={selectedConversation}
                  onClose={() => setSelectedConversation(null)}
                  onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
                />
              </div>

              {/* SIDEBAR PHẢI (Thông tin nhóm) */}
              {isRightSidebarOpen && (
                <ChatRightSidebar 
                  conversation={currentConversationData}
                  onClose={() => setIsRightSidebarOpen(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;