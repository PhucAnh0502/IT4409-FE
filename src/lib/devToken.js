/**
 * Development Token Generator cho GetStream
 * CHỈ DÙNG CHO DEVELOPMENT/TESTING
 * Production phải dùng token từ backend với secret key
 */

/**
 * Tạo một development token đơn giản
 * Lưu ý: Đây KHÔNG phải là token thật, chỉ để bypass authentication trong dev
 */
export const createDevToken = (userId) => {
  // Tạo một JWT-like token đơn giản
  // Header
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  
  // Payload - thêm user_id theo format GetStream
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    user_id: userId,
    iat: now,
    exp: now + (60 * 60 * 24 * 30) // 30 days
  };
  
  // Base64 encode
  const encodeBase64 = (obj) => {
    return btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  const encodedHeader = encodeBase64(header);
  const encodedPayload = encodeBase64(payload);
  
  // Tạo fake signature (trong dev mode, GetStream có thể không verify)
  const signature = btoa(`dev-signature-${userId}`).replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Fallback: nếu token generation fail, return undefined
 * để StreamVideoClient tự handle
 */
export const getDevToken = (userId) => {
  try {
    return createDevToken(userId);
  } catch (error) {
    console.error("Error creating dev token:", error);
    return undefined;
  }
};
