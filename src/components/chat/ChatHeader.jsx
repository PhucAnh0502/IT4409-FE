import React, { useMemo } from "react";
import { X, EllipsisVertical, Video, Phone } from "lucide-react";
import { useConversationStore } from "../../stores/useConversationStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useCall } from "../../contexts/CallContext";
import { generateCallId, getCallParticipants } from "../../lib/streamUtils";
import { extractUserInfo } from "../../lib/jwtUtils";
import { sanitizeUserId } from "../../lib/callHelpers";
import { getUserIdFromToken } from "../../lib/utils";
import toast from "react-hot-toast";

const ChatHeader = ({ close, message, toggleSidebar }) => {
  const { selectedConversation, conversations } = useConversationStore();
  const { authUser } = useAuthStore();
  const { client, setActiveCall, setOutgoingCall } = useCall();

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
    // Get userId from token instead of authUser
    const currentUserId = getUserIdFromToken();
    const currentUserName = authUser?.name || authUser?.fullName || authUser?.userName || currentUserId;

    console.log('🔍 DEBUG handleStartCall:', {
      currentConversation,
      currentUserId,
      currentUserName,
      client,
      hasClient: !!client
    });

    if (!currentConversation || !client || !currentUserId) {
      console.error('❌ Failed initial check:', {
        hasConversation: !!currentConversation,
        hasClient: !!client,
        hasUserId: !!currentUserId
      });
      toast.error("Không thể khởi tạo cuộc gọi");
      return;
    }

    try {
      const conversationId = currentConversation.id || currentConversation._id;
      console.log('📞 Starting call with conversationId:', conversationId);
      console.log('👤 User info:', { currentUserId, currentUserName });

      const callParticipants = getCallParticipants(currentConversation, currentUserId);
      console.log('👥 Call participants:', callParticipants);

      if (callParticipants.length === 0) {
        toast.error("Không tìm thấy người nhận cuộc gọi");
        return;
      }
      // Tạo call ID
      const callId = generateCallId(conversationId);
      // Chọn call type
      // Use 'default' for both audio and video calls and mark audio-only via custom flag.
      // Using 'audio_room' can require special JoinBackstage permissions on the coordinator
      // which consumer tokens issued by the local token server may not include.
      const callType = 'default';
      const call = client.call(callType, callId);
      // Prepare member IDs
      const sanitizedUserId = sanitizeUserId(currentUserId);
      const sanitizedParticipants = callParticipants.map(p => ({
        userId: sanitizeUserId(p.userId),
        name: p.name || p.userId
      }));

      console.log('👥 Sanitized participants:', sanitizedParticipants);

      // Prepare member user IDs for the call
      const memberUserIds = [
        sanitizedUserId,
        ...sanitizedParticipants.map(p => p.userId)
      ];

      console.log('📞 Creating call with member IDs:', memberUserIds);

      // Set outgoing call state để hiển thị waiting screen
      setOutgoingCall({
        receiverName: callParticipants[0]?.name || 'Someone',
        isAudioOnly: isAudioOnly,
        callId,
        callType,
      });

      // Create call và bắt đầu ring
      // Note: Stream will automatically create users when they join/receive calls
      await call.getOrCreate({
        ring: true,
        data: {
          members: memberUserIds.map(userId => ({ user_id: userId })),
          custom: { isAudioOnly }
        },
      });
      // KHÔNG join call ở đây! Chờ receiver accept mới join
      toast.success("Đang gọi...");
    } catch (error) {
      console.error("Error starting call:", error);
      setOutgoingCall(null);
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