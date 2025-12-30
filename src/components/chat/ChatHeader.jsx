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
  const { client, startCall } = useCall();
  const [isInitializing, setIsInitializing] = useState(false);

  const currentConversation = useMemo(() => {
    if (!selectedConversation || !conversations) return null;
    return conversations.find(
      (conv) => conv?.id === selectedConversation
    );
  }, [selectedConversation, conversations]);

  const getConversationName = () => currentConversation?.name || "Conversation";
  const getAvatarUrl = () => currentConversation?.avatarUrl || message?.receiverAvatarUrl || "/default-avatar.png";
  const conversationName = getConversationName();

  const handleStartCall = async (isAudioOnly = false) => {
    const currentUserId = getUserIdFromToken();
    if (!currentConversation || !currentUserId) return;

    // Check if client exists
    if (!client) {
      toast.error('Vui lòng đợi kết nối...');
      return;
    }
    let currentUserName = authUser?.userName;
    if (!currentUserName) {
      console.log('Fetching userName from API...');
      currentUserName = await getUserName(currentUserId);
      console.log('Fetched userName:', currentUserName);
    }

    try {
      setIsInitializing(true);
      const loadingToast = toast.loading("Đang kết nối...");

      const conversationId = currentConversation.id || currentConversation._id;
      const callParticipants = getCallParticipants(currentConversation, currentUserId);

      if (callParticipants.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Không tìm thấy người nhận");
        return;
      }

      // Generate tokens for all participants (creates users on Stream)
      try {
        await Promise.all(
          callParticipants.map(p => getStreamToken(p.userId).catch(e => console.error("Token generation error:", e)))
        );
      } catch (e) {
        console.warn("Some users not activated on Stream: ", e);
      }

      const sanitizedUserId = sanitizeUserId(currentUserId);
      const memberUserIds = [
        sanitizedUserId,
        ...callParticipants.map(p => sanitizeUserId(p.userId))
      ];

      const callId = generateCallId(conversationId);
      const call = client.call('default', callId);

      // Create and join the call
      await call.getOrCreate({
        ring: true,
        data: {
          members: memberUserIds.map(id => ({ user_id: id, role: 'call_member' })),
          custom: {
            isAudioOnly,
            callerName: currentUserName,
            participantCount: memberUserIds.length, // Total number of participants in the call
          }
        },
      });

      // Join as caller
      await call.join();

      // Set outgoing call state with call object
      startCall({
        receiverName: callParticipants[0]?.name || 'Người dùng',
        isAudioOnly,
        callId,
        callType: 'default',
        call,
      });

      toast.dismiss(loadingToast);
      toast.success("Đang đổ chuông...");
    } catch (error) {
      console.error(" Error starting call:", error);
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