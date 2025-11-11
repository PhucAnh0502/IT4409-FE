import React from "react";
import Sidebar from "../components/chat/Sidebar.jsx";
import NoChatSelected from "../components/chat/NoChatSelected.jsx";
import ChatContainer from "../components/chat/ChatContainer.jsx";

const HomePage = () => {
  const selectedUser = true;

  return (
    <div className="h-screen bg-base-200">
        <div className="bg-base-100 w-full h-full">
          <div className="flex h-full overflow-hidden pt-16 pb-2 pl-2 pr-2">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
    </div>
  );
};

export default HomePage;
