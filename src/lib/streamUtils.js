import { StreamVideoClient } from "@stream-io/video-react-sdk";

const API_KEY = import.meta.env.VITE_GETSTREAM_API_KEY; // API key từ .env

/**
 * Tạo user token cho GetStream Video
 * Trong production, token nên được tạo từ backend
 * Để demo, ta sẽ sử dụng development token
 */
export const createUserToken = async (userId) => {
  try {
    // Trong môi trường development, GetStream cho phép dùng client-side token generation
    // Trong production, bạn cần gọi API backend để lấy token
    
    // Tạm thời return một token development
    // Bạn cần thay thế bằng việc gọi API backend hoặc sử dụng secret key
    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: { id: userId },
    });
    
    return client;
  } catch (error) {
    console.error("Error creating user token:", error);
    throw error;
  }
};

/**
 * Tạo call ID dựa trên conversation
 */
export const generateCallId = (conversationId) => {
  return `call-${conversationId}-${Date.now()}`;
};

/**
 * Lấy danh sách participants từ conversation
 */
export const getCallParticipants = (conversation, currentUserId) => {
  
  
  if (!conversation) {
    console.error("No conversation provided");
    return [];
  }
  
  const participants = [];
  
  // Trường hợp 1: Group chat với members
  if (conversation.isGroup && conversation.members && Array.isArray(conversation.members)) {
   
    conversation.members.forEach(member => {
      const memberId = member.userId || member.id || member.user?.id;
      if (memberId && memberId !== currentUserId) {
        participants.push({
          userId: memberId,
          name: member.name || member.fullName || member.userName || memberId,
        });
      }
    });
  }
  
  // Trường hợp 2: Chat với participants array
  else if (conversation.participants && Array.isArray(conversation.participants)) {
    
    conversation.participants.forEach(p => {
      const pId = p.userId || p.id || p.user?.id;
      if (pId && pId !== currentUserId) {
        participants.push({
          userId: pId,
          name: p.name || p.fullName || p.userName || pId,
        });
      }
    });
  }
  
  // Trường hợp 3: Chat 1-1 với receiverId
  else if (conversation.receiverId && conversation.receiverId !== currentUserId) {
   
    participants.push({
      userId: conversation.receiverId,
      name: conversation.receiverName || conversation.name || conversation.receiverId,
    });
  }
  
  // Trường hợp 4: Fallback - tìm trong tất cả các fields có thể
  else {
    
    
    // Thử lấy từ user/receiver object
    const receiver = conversation.receiver || conversation.user;
    if (receiver) {
      const receiverId = receiver.id || receiver.userId || receiver._id;
      if (receiverId && receiverId !== currentUserId) {
        participants.push({
          userId: receiverId,
          name: receiver.name || receiver.fullName || receiver.userName || receiverId,
        });
      }
    }
  }
  
  
  return participants;
};
