/**
 * Friend Data Mapper
 * Maps API response fields to component-friendly format
 * Provides backward compatibility with mock data structure
 */

/**
 * Maps a single friend object from API format to component format
 * @param {Object} apiFriend - Friend object from API
 * @param {string} apiFriend.friendshipId - Unique friendship ID
 * @param {string} apiFriend.friendUserId - Friend's user ID
 * @param {string} apiFriend.friendUserName - Friend's username
 * @param {string} apiFriend.friendAvatarUrl - Friend's avatar (base64 or URL)
 * @param {string} apiFriend.createdAt - Friendship creation date
 * @returns {Object} Mapped friend object for components
 */
export const mapFriendData = (apiFriend) => {
    if (!apiFriend) return null;

    return {
        // Map API fields to component fields
        id: apiFriend.friendshipId || apiFriend.id,
        name: apiFriend.friendUserName || apiFriend.name || 'Unknown',
        avatarUrl: apiFriend.friendAvatarUrl || apiFriend.avatarUrl || null,

        // Additional fields for advanced features
        userId: apiFriend.friendUserId,
        createdAt: apiFriend.createdAt,

        // Default value for fields not provided by API
        mutualFriends: apiFriend.mutualFriends || 0,

        // Keep original API data for reference
        _original: apiFriend
    };
};

/**
 * Maps an array of friends from API format
 * @param {Array} apiFriends - Array of friend objects from API
 * @returns {Array} Array of mapped friend objects
 */
export const mapFriendsArray = (apiFriends) => {
    if (!Array.isArray(apiFriends)) return [];
    return apiFriends.map(mapFriendData).filter(Boolean);
};

/**
 * Generates fallback avatar URL if none provided
 * @param {string} name - Friend's name
 * @returns {string} Fallback avatar URL
 */
export const getFallbackAvatar = (name) => {
    const displayName = name || 'Unknown';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
};
