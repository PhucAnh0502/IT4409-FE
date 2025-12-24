import { authAxiosInstance } from "./axios";
import {API} from "../lib/api";

export const getStreamToken = async (userId) => {
  try {
    console.log('📡 Requesting GetStream token for userId:', userId);

    const response = await authAxiosInstance.post(API.VIDEOCALL.GET_TOKEN, {
      UserIds: [userId], 
    });

    // Kiểm tra xem dữ liệu nằm ở response.data hay nằm trực tiếp ở response
    const data = response.data || response;
    
    // Backend trả về: { Token: { "guid": "string-token" } }
    // Chúng ta tìm key 'Token' hoặc 'token'
    const tokenMap = data?.Token || data?.token;

    if (!tokenMap) {
      console.error('❌ Cấu trúc Response không khớp:', data);
      throw new Error('Không tìm thấy dữ liệu Token trong phản hồi từ server');
    }

    // Lấy token từ Dictionary bằng userId
    let token = tokenMap[userId];

    // Nếu không tìm thấy bằng key userId, lấy giá trị đầu tiên trong object
    if (!token) {
      const keys = Object.keys(tokenMap);
      if (keys.length > 0) {
        token = tokenMap[keys[0]];
      }
    }

    if (!token) throw new Error('Token trống');

    return token.replace(/"/g, '').trim(); // Xóa dấu ngoặc kép nếu có

  } catch (error) {
    console.error('❌ Error in getStreamToken:', error);
    throw error;
  }
};