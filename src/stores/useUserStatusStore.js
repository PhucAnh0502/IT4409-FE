import { create } from "zustand";

// Store for managing online/offline users status
export const useUserStatusStore = create((set, get) => ({
  // Map of userId -> status object
  onlineUsers: {},
  
  // Current user info
  currentUser: null,

  // Set current user
  setCurrentUser: (user) => set({ currentUser: user }),

  // Add or update user status
  setUserStatus: (userId, isOnline, metadata = {}) => {
    console.log('[useUserStatusStore] setUserStatus called:', { userId, isOnline, metadata });
    set((state) => {
      const newState = {
        onlineUsers: {
          ...state.onlineUsers,
          [userId]: {
            userId,
            isOnline,
            lastSeen: isOnline ? new Date().toISOString() : metadata.lastSeen || new Date().toISOString(),
            ...metadata
          }
        }
      };
      console.log('[useUserStatusStore] New state after setUserStatus:', newState);
      return newState;
    });
  },

  // Set multiple users status at once
  setUsersStatus: (users) => {
    console.log('[useUserStatusStore] setUsersStatus called with:', users);
    set((state) => {
      const newOnlineUsers = { ...state.onlineUsers };
      users.forEach(user => {
        newOnlineUsers[user.userId] = {
          userId: user.userId,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen || new Date().toISOString(),
          ...user
        };
      });
      console.log('[useUserStatusStore] New onlineUsers after setUsersStatus:', newOnlineUsers);
      return { onlineUsers: newOnlineUsers };
    });
  },

  // Mark user as online
  setUserOnline: (userId, metadata = {}) => {
    get().setUserStatus(userId, true, metadata);
  },

  // Mark user as offline
  setUserOffline: (userId, metadata = {}) => {
    get().setUserStatus(userId, false, metadata);
  },

  // Remove user from tracking
  removeUser: (userId) => {
    set((state) => {
      const { [userId]: removed, ...rest } = state.onlineUsers;
      return { onlineUsers: rest };
    });
  },

  // Get user status
  getUserStatus: (userId) => {
    return get().onlineUsers[userId] || null;
  },

  // Check if user is online
  isUserOnline: (userId) => {
    return get().onlineUsers[userId]?.isOnline || false;
  },

  // Get all online users
  getOnlineUsers: () => {
    return Object.values(get().onlineUsers).filter(user => user.isOnline);
  },

  // Get all users (online and offline)
  getAllUsers: () => {
    return Object.values(get().onlineUsers);
  },

  // Get online users in a specific room
  getOnlineUsersInRoom: (room) => {
    return Object.values(get().onlineUsers).filter(
      user => user.isOnline && user.currentRoom === room
    );
  },

  // Clear all users
  clearUsers: () => set({ onlineUsers: {} }),
}));

export default useUserStatusStore;
