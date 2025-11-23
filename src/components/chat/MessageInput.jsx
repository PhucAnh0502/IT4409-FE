import React, { useState } from "react";
import { Image, Send, X } from "lucide-react";
import { useConversationStore } from "../../stores/useConversationStore";
import { getUserIdFromToken } from "../../lib/utils";
import { useSignalRConnection } from "../../contexts/SignalRContext";
import * as signalR from "@microsoft/signalr";

const MessageInput = ({ conversationId }) => {
  const [text, setText] = useState("");
  const { sendMessage } = useConversationStore();
  const userId = getUserIdFromToken();
  const connection = useSignalRConnection();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || !conversationId) return;

    if (connection) {
      try {
        if (connection.state !== signalR.HubConnectionState.Connected) {
          await connection.start();
        }
        await connection.invoke("JoinConversation", conversationId.toString());
      } catch (e) {
        console.error("SignalR connection/join conversation error:", e);
      }
    }

    // const optimistic = { senderId: userId, content: text, createdAt: new Date().toISOString(), conversationId: conversationId };
    // appendMessage(conversationId, optimistic);

    try {
      await sendMessage({senderId: userId, content: text, conversationId: conversationId});
      setText("");
    } catch (e) {
      // optionally rollback or show error
      console.error("Failed to send message:", e);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* <div className="mb-3 flex items-center gap-2">
        <div className="relative">
          <img
            src={"/vite.svg"}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
          />
          <button
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
            type="button"
          >
            <X className="size-3" />
          </button>
        </div>
      </div> */}

      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle text-emerald-500`}
          >
            <Image size={20} />
          </button>
        </div>
        <button type="submit" className="btn btn-sm btn-circle">
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;