// JWT Token utilities

/**
 * Decode JWT token để lấy thông tin user
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // JWT có 3 phần: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode phần payload (phần thứ 2)
    const payload = parts[1];
    
    // Base64 decode
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

/**
 * Lấy userId từ token
 */
export const getUserIdFromToken = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  // Thử các trường phổ biến trong JWT
  return payload.sub || 
         payload.userId || 
         payload.id || 
         payload.user_id ||
         payload.nameid || // ASP.NET
         payload.unique_name;
};

/**
 * Lấy user info từ authUser object
 */
export const extractUserInfo = (authUser) => {
  if (!authUser) {
    console.error("No authUser provided");
    return { userId: null, userName: null };
  }
  
  console.log("Extracting user info from:", authUser);
  
  // Thử lấy userId từ nhiều nguồn
  let userId = authUser.id || 
               authUser.userId || 
               authUser.user?.id || 
               authUser.user?.userId;
  
  // Nếu không có, thử decode từ token
  if (!userId && authUser.token) {
    userId = getUserIdFromToken(authUser.token);
    console.log("Extracted userId from token:", userId);
  }
  
  if (!userId && authUser.accessToken) {
    userId = getUserIdFromToken(authUser.accessToken);
    console.log("Extracted userId from accessToken:", userId);
  }
  
  // Lấy userName
  const userName = authUser.name || 
                   authUser.userName || 
                   authUser.fullName ||
                   authUser.user?.name ||
                   userId;
  
  console.log("Final extracted info:", { userId, userName });
  
  return { userId, userName };
};
