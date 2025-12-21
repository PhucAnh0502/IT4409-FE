/**
 * Service để lấy GetStream token từ token server
 */

const TOKEN_SERVER_URL = 'http://localhost:3001';

/**
 * Lấy GetStream token cho user
 * @param {string} userId - ID của user cần lấy token
 * @returns {Promise<string>} GetStream token
 */
export const getStreamToken = async (userId) => {
  try {
    console.log('📡 Requesting GetStream token for userId:', userId);
    
    const response = await fetch(`${TOKEN_SERVER_URL}/api/getstream/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to get token: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('GetStream token received successfully');
    
    return data.token;
  } catch (error) {
    console.error('Error getting GetStream token:', error);
    
    // Kiểm tra xem có phải lỗi kết nối đến token server không
    if (error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến Token Server. Vui lòng chạy: npm run token-server');
    }
    
    throw error;
  }
};

/**
 * Kiểm tra xem token server có đang chạy không
 * @returns {Promise<boolean>}
 */
export const checkTokenServerHealth = async () => {
  try {
    const response = await fetch(`${TOKEN_SERVER_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
