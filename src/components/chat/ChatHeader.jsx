import React, { useMemo } from "react";
import { X, EllipsisVertical, Video, Phone } from "lucide-react"; 
import { useConversationStore } from "../../stores/useConversationStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useCall } from "../../contexts/CallContext";
import { generateCallId, getCallParticipants } from "../../lib/streamUtils";
import { extractUserInfo } from "../../lib/jwtUtils";
import { sanitizeUserId } from "../../lib/callHelpers";
import toast from "react-hot-toast";

const ChatHeader = ({ close, message, toggleSidebar }) => {
  const { selectedConversation, conversations } = useConversationStore();
  const { authUser } = useAuthStore();
  const { client, setActiveCall } = useCall();

  const currentConversation = useMemo(() => {
    if (!selectedConversation || !conversations) return null;
    return conversations.find(
      (conv) => conv?.id === selectedConversation || conv?._id === selectedConversation
    );
  }, [selectedConversation, conversations]);

  const getConversationName = () => currentConversation?.name || "Conversation";
  const getAvatarUrl = () => currentConversation?.avatarUrl || message?.receiverAvatarUrl || "/default-avatar.png";
  const conversationName = getConversationName();

  // Xử lý khởi tạo cuộc gọi
  const handleStartCall = async (isAudioOnly = false) => {
    console.log("=== DEBUG: handleStartCall ===");
    console.log("Audio only:", isAudioOnly);
    
    if (!currentConversation || !authUser || !client) {
      toast.error("Không thể khởi tạo cuộc gọi");
      return;
    }

    try {
      const conversationId = currentConversation.id || currentConversation._id;
      const { userId: currentUserId, userName: currentUserName } = extractUserInfo(authUser);
      
      if (!currentUserId) {
        toast.error("Không thể xác định user ID");
        return;
      }
      
      const callParticipants = getCallParticipants(currentConversation, currentUserId);
      
      if (callParticipants.length === 0) {
        toast.error("Không tìm thấy người nhận cuộc gọi");
        return;
      }

      // Tạo call ID
      const callId = generateCallId(conversationId);
      
      // Tạo call với GetStream - luôn dùng "default" type
      const call = client.call('default', callId);
      
      // Tạo members list với username
      const sanitizedUserId = sanitizeUserId(currentUserId);
      const members = [
        { 
          user_id: sanitizedUserId,
          custom: { name: currentUserName || sanitizedUserId }
        },
        ...callParticipants.map(p => ({ 
          user_id: sanitizeUserId(p.userId),
          custom: { name: p.name || p.userId }
        }))
      ];
      
      // Create call và bắt đầu ring
      await call.getOrCreate({
        ring: true,
        data: { 
          members,
          custom: { isAudioOnly } // Lưu thông tin audio only
        },
      });
      
      console.log("Call created, joining...");
      
      // Join call
      await call.join();
      
      // Nếu là audio call, tắt camera
      if (isAudioOnly) {
        console.log('🎤 Audio-only call, disabling camera');
        await call.camera.disable();
      }
      
      // Set active call
      setActiveCall(call);
      
      toast.success("Đang gọi...");
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error(`Lỗi: ${error.message}`);
    }
  };


  return (
    <div className="p-2.5 border-b border-base-300 flex-shrink-0"> 
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={getAvatarUrl()} alt={conversationName} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{conversationName}</h3>
            <p className="text-sm text-base-content/70">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
            <button
                className="p-2 hover:bg-base-300 rounded-full transition-colors"
                onClick={() => handleStartCall(false)}
                aria-label="Video call"
                title="Video call"
            >
                <Video className="size-5" />
            </button>

            <button
                className="p-2 hover:bg-base-300 rounded-full transition-colors"
                onClick={() => handleStartCall(true)}
                aria-label="Phone call"
                title="Phone call"
            >
                <Phone className="size-5" />
            </button>

            <button
                className="p-2 hover:bg-base-300 rounded-full transition-colors"
                onClick={toggleSidebar}
                aria-label="Conversation info"
            >
                <EllipsisVertical className="size-5" />
            </button>

            <button
                className="p-2 hover:bg-base-300 rounded-full transition-colors"
                onClick={close}
                aria-label="Close conversation"
            >
                <X className="size-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;