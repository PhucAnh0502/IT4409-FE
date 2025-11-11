import React from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

const ChatContainer = () => {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* --- Tin nhắn mẫu 1: Người nhận (chat-start) - Chỉ text --- */}
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="size-10 rounded-full border">
              <img src={"/vite.svg"} alt="avatar" />
            </div>
          </div>
          <div className="chat-header mb-1">
            <time className="text-xs opacity-50 ml-1">10:00 AM</time>
          </div>
          <div className="chat-bubble flex flex-col">
            <p>Hello! How are you?</p>
          </div>
        </div>

        {/* --- Tin nhắn mẫu 2: Người gửi (chat-end) - Text và Image --- */}
        <div className="chat chat-end">
          <div className="chat-image avatar">
            <div className="size-10 rounded-full border">
              <img src={"/vite.svg"} alt="avatar" />
            </div>
          </div>
          <div className="chat-header mb-1">
            <time className="text-xs opacity-50 ml-1">10:01 AM</time>
          </div>
          <div className="chat-bubble flex flex-col">
            <img
              src={"/vite.svg"}
              alt="image"
              className="sm:max-w-[200px] rounded-md mb-2"
            />
            <p>I'm good, thanks! Check out this image.</p>
          </div>
        </div>

        {/* --- Tin nhắn mẫu 3: Người nhận (chat-start) - Chỉ Image --- */}
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="size-10 rounded-full border">
              <img src={"/vite.svg"} alt="avatar" />
            </div>
          </div>
          <div className="chat-header mb-1">
            <time className="text-xs opacity-50 ml-1">10:02 AM</time>
          </div>
          <div className="chat-bubble flex flex-col">
            <img
              src={"/vite.svg"}
              alt="image"
              className="sm:max-w-[200px] rounded-md"
            />
          </div>
        </div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
