import React, { useMemo, useState } from "react";
import { X, EllipsisVertical, Video, Phone } from "lucide-react";
import { useConversationStore } from "../../stores/useConversationStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useCall } from "../../contexts/CallContext";
import { generateCallId, getCallParticipants } from "../../lib/streamUtils";
import { sanitizeUserId } from "../../lib/callHelpers";
import { getUserIdFromToken } from "../../lib/utils";
import { getUserName } from "../../lib/userService";
import { getStreamToken } from "../../lib/tokenService";
import toast from "react-hot-toast";

const ChatHeader = ({ close, message, toggleSidebar }) => {
  const { selectedConversation, conversations } = useConversationStore();
  const { authUser } = useAuthStore();
  const { initClient, setOutgoingCall } = useCall();
  const [isInitializing, setIsInitializing] = useState(false);

  const currentConversation = useMemo(() => {
    if (!selectedConversation || !conversations) return null;
    return conversations.find(
      (conv) => conv?.id === selectedConversation || conv?._id === selectedConversation
    );
  }, [selectedConversation, conversations]);

  const conversationName = currentConversation?.name || "Conversation";
  const avatarUrl = currentConversation?.avatarUrl || message?.receiverAvatarUrl || "/default-avatar.png";

  const handleStartCall = async (isAudioOnly = false) => {
    const currentUserId = getUserIdFromToken();
    if (!currentConversation || !currentUserId) return;
    
    try {
      setIsInitializing(true);
      const loadingToast = toast.loading("Đang kết nối...");
    
      // 1. Khởi tạo client cho chính mình
      const videoClient = await initClient();
    
      const conversationId = currentConversation.id || currentConversation._id;
      const callParticipants = getCallParticipants(currentConversation, currentUserId);
    
      if (callParticipants.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Không tìm thấy người nhận");
        return;
      }
    
      // 2. KÍCH HOẠT USER NGƯỜI NHẬN (QUAN TRỌNG)
      // Việc gọi getStreamToken cho người nhận giúp Backend thực hiện lệnh userClient.CreateToken() 
      // cho họ, từ đó Stream SDK mới nhận diện được các ID này tồn tại.
      try {
        await Promise.all(
          callParticipants.map(p => getStreamToken(p.userId).catch(e => console.error("Kích hoạt user lỗi:", e)))
        );
      } catch (e) {
        console.warn("Một số user chưa được kích hoạt trên Stream");
      }
    
      const sanitizedUserId = sanitizeUserId(currentUserId);
      const memberUserIds = [
        sanitizedUserId,
        ...callParticipants.map(p => sanitizeUserId(p.userId))
      ];
    
      const callId = generateCallId(conversationId);
      const call = videoClient.call('default', callId);
    
      setOutgoingCall({
        receiverName: callParticipants[0]?.name || 'Người dùng',
        isAudioOnly,
        callId,
        callType: 'default',
      });
    
      // 3. Tạo cuộc gọi
      // Chúng ta thêm 'create: true' để đảm bảo cuộc gọi được khởi tạo
      await call.getOrCreate({
        ring: true,
        data: {
          members: memberUserIds.map(id => ({ user_id: id, role: 'call_member' })),
          custom: { 
            isAudioOnly, 
            callerName: authUser?.userName || "Ai đó" 
          }
        },
      });
    
      toast.dismiss(loadingToast);
      toast.success("Đang đổ chuông...");
    } catch (error) {
      console.error("❌ Error starting call:", error);
      toast.dismiss();
      toast.error("Không thể bắt đầu cuộc gọi. Vui lòng thử lại.");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={avatarUrl} alt={conversationName} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{conversationName}</h3>
            <p className="text-sm text-base-content/70">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className={`p-2 rounded-full transition-colors ${isInitializing ? 'opacity-40' : 'hover:bg-base-300'}`}
            onClick={() => !isInitializing && handleStartCall(false)}
            disabled={isInitializing}
            title="Video call"
          >
            <Video className="size-5" />
          </button>

          <button
            className={`p-2 rounded-full transition-colors ${isInitializing ? 'opacity-40' : 'hover:bg-base-300'}`}
            onClick={() => !isInitializing && handleStartCall(true)}
            disabled={isInitializing}
            title="Phone call"
          >
            <Phone className="size-5" />
          </button>

          <button className="p-2 hover:bg-base-300 rounded-full transition-colors" onClick={toggleSidebar}>
            <EllipsisVertical className="size-5" />
          </button>

          <button className="p-2 hover:bg-base-300 rounded-full transition-colors" onClick={close}>
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;