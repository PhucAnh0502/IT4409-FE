import React, { useState, useRef } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { useConversationStore } from "../../stores/useConversationStore";
import { getUserIdFromToken } from "../../lib/utils";
import { useSignalRConnection } from "../../contexts/SignalRContext";
import * as signalR from "@microsoft/signalr";
import toast from "react-hot-toast";

const MessageInput = ({ conversationId }) => {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);

  const { sendMessage, uploadFile } = useConversationStore();
  const userId = getUserIdFromToken();
  const connection = useSignalRConnection();

  const handleChangeFile = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if(file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds the 5MB size limit.`);
        return;
      }
      return true;
    })

    if(validFiles.length === 0) return;

    setSelectedFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const fileType = file.type.startsWith("image/") ? "image" : "file";
        const previewItem = {
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            name: file.name,
            size: file.size,
            type: fileType,
            url: fileType === "image" ? URL.createObjectURL(file) : null
        };
        setImagePreviews(prev => [...prev, previewItem]);
    })

    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const removeFile = (idToRemove) => {
    setImagePreviews(prev => prev.filter(item => item.id !== idToRemove));
    setSelectedFiles(prevFiles => {
        const remainingPreviews = imagePreviews.filter(item => item.id !== idToRemove);
        return remainingPreviews.map(p => p.file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFiles.length) || !conversationId) return;

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

    setIsSending(true);

    try {
      let uploadedUrls = [];

      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => uploadFile(file));
        
        const results = await Promise.all(uploadPromises);
        
        uploadedUrls = results.filter(url => url !== null);
      }

      if (selectedFiles.length > 0 && uploadedUrls.length === 0) {
          toast.error("Không thể tải tệp lên. Vui lòng thử lại.");
          setIsSending(false);
          return;
      }

      await sendMessage({
        senderId: userId, 
        content: text, 
        conversationId: conversationId, 
        mediaUrls : uploadedUrls,
      });
      setText("");
      setSelectedFiles([]);
      setImagePreviews([]);
    } catch (e) {
      console.error("Failed to send message:", e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 w-full bg-base-100">
      {imagePreviews.length > 0 && (
        <div className="flex gap-3 overflow-x-auto mb-3 pt-2 pb-2 scrollbar-thin scrollbar-thumb-base-300">
            {imagePreviews.map((item) => (
                <div key={item.id} className="relative flex-shrink-0 group">
                    <div className="w-20 h-20 rounded-lg border border-base-300 bg-base-200 overflow-hidden flex items-center justify-center">
                        {item.type === "image" ? (
                            <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                            <FileText className="text-primary w-8 h-8" />
                        )}
                    </div>
                    <button
                        onClick={() => removeFile(item.id)}
                        className="absolute -top-1.5 -right-1.5 bg-base-300 rounded-full p-0.5 shadow-md border border-base-content/20 hover:bg-error hover:text-white transition-colors"
                        type="button"
                    >
                        <X size={14} />
                    </button>
                    {item.type === "file" && (
                        <div className="text-[10px] truncate max-w-[80px] text-center mt-1">{item.name}</div>
                    )}
                </div>
            ))}
        </div>
      )}

      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            disabled={isSending}
          />
          
          <input
            type="file"
            multiple 
            ref={fileInputRef}
            onChange={handleChangeFile}
            style={{ display: "none" }}
          />
          
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle text-emerald-500`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Paperclip size={20} />
          </button>
        </div>
        
        <button 
            type="submit" 
            className="btn btn-circle"
            disabled={(!text.trim() && selectedFiles.length === 0) || isSending}
        >
          {isSending ? <span className="loading loading-spinner loading-xs"></span> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;