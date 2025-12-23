/**
 * Service để lấy GetStream token từ backend API
 */

import { authAxiosInstance } from './axios';
import { API } from './api';

/**
 * Lấy GetStream token cho user
 * @param {string} userId - ID của user cần lấy token
 * @returns {Promise<string>} GetStream token
 */
export const getStreamToken = async (userId) => {
  try {
    console.log('📡 Requesting GetStream token for userId:', userId);

    const response = await authAxiosInstance.post(API.VIDEOCALL.GET_TOKEN, {
      senderId: userId,
    });

    //console.log('✅ GetStream token response:', response);
    //console.log('Response type:', typeof response);
    //console.log('Response keys:', Object.keys(response || {}));

    // Backend trả về { Token: "..." } với chữ T hoa
    // hoặc có thể là { token: "..." } với chữ t thường
    let token = response?.Token || response?.token || response?.data?.Token || response?.data?.token;

    //console.log('🔍 Raw token (before cleaning):', token);
    //console.log('Token type:', typeof token);
//
    //if (!token || typeof token !== 'string') {
    //  console.error('❌ Invalid token received:', token);
    //  throw new Error('Invalid token format received from server');
    //}

    // Clean token: xóa whitespace và dấu ngoặc kép dư thừa
    token = token.trim();

    // Nếu token bị wrap trong dấu ngoặc kép, xóa chúng đi
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
      //console.log('⚠️ Removed surrounding quotes from token');
    }

    // Kiểm tra lại sau khi clean
    //if (!token || token.length === 0) {
    //  console.error('❌ Token is empty after cleaning');
    //  throw new Error('Empty token received from server');
    //}

    //console.log('✅ Token extracted and cleaned successfully');
    //console.log('Token length:', token.length);
    //console.log('Token preview:', token.substring(0, 20) + '...');

    return token;
  } catch (error) {
    console.error('❌ Error getting GetStream token:', error);

    if (error.response) {
      // Server trả về lỗi
      throw new Error(error.response.data?.message || `Failed to get token: ${error.response.statusText}`);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Lỗi khác
      throw new Error(error.message || 'Đã xảy ra lỗi khi lấy token');
    }
  }
};
