/**
 * Service để lấy thông tin user từ API
 */

import { authAxiosInstance } from './axios';
import { API } from './api';

// Cache user data để tránh gọi API nhiều lần
const userCache = new Map();

/**
 * Lấy thông tin user từ API
 * @param {string} userId - ID của user
 * @returns {Promise<{userName: string, fullName: string, email: string}>}
 */
export const getUserInfo = async (userId) => {
    if (!userId) {
        console.warn('getUserInfo: userId is null/undefined');
        return null;
    }

    // Check cache first
    if (userCache.has(userId)) {
        
        return userCache.get(userId);
    }

    try {
        

        const response = await authAxiosInstance.get(API.USER.GET_USER(userId));

        if (response && response.userName) {
            const userInfo = {
                userName: response.userName,
                fullName: response.fullName,
                email: response.email,
                id: response.id,
                avatarUrl: response.avatarUrl,
            };

            // Cache the result
            userCache.set(userId, userInfo);

            return userInfo;
        }

        console.warn('getUserInfo: API response missing userName', response);
        return null;
    } catch (error) {
        console.error('getUserInfo: Error fetching user info for', userId, error);
        return null;
    }
};

/**
 * Lấy chỉ userName từ userId
 * @param {string} userId 
 * @returns {Promise<string|null>}
 */
export const getUserName = async (userId) => {
    const userInfo = await getUserInfo(userId);
    return userInfo?.userName || null;
};

/**
 * Clear cache cho một user hoặc toàn bộ cache
 * @param {string} userId - Optional, nếu không truyền sẽ clear all
 */
export const clearUserCache = (userId = null) => {
    if (userId) {
        userCache.delete(userId);
    } else {
        userCache.clear();
    }
};
