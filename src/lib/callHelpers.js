// Utility để format userId cho GetStream
// GetStream yêu cầu user_id không có ký tự đặc biệt

export const sanitizeUserId = (userId) => {
  if (!userId) return null;
  
  // Chuyển userId thành string và loại bỏ ký tự đặc biệt
  // Chỉ giữ lại chữ cái, số, dấu gạch dưới và gạch ngang
  return String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
};

// Lấy tên hiển thị từ user object
export const getUserDisplayName = (user) => {
  if (!user) return 'Unknown';
  return user.name || user.fullName || user.username || user.userId || user.id || 'Unknown';
};

// Tạo member object cho GetStream call
export const createCallMember = (userId, userName = null) => {
  const sanitizedId = sanitizeUserId(userId);
  
  return {
    user_id: sanitizedId,
    custom: {
      name: userName || sanitizedId,
    }
  };
};
