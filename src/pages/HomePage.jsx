import React, { useState, useEffect } from "react";
import Sidebar from "../components/chat/Sidebar.jsx";
import NoChatSelected from "../components/chat/NoChatSelected.jsx";
import ChatContainer from "../components/chat/ChatContainer.jsx";
import { useSignalRConnection } from "../contexts/SignalRContext";
import { useConversationStore } from "../stores/useConversationStore";
import { Menu } from "lucide-react";

const HomePage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const connection = useSignalRConnection();
  const setStoreSelectedConversation = useConversationStore((s) => s.setSelectedConversation);

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
