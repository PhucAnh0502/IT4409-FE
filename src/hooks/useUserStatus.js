import { useEffect } from 'react';
import { socketService } from '../lib/socket';
import { useUserStatusStore } from '../stores/useUserStatusStore';

/**
 * React hook for managing user online/offline status
 * Automatically syncs with Socket.IO server
 */
export const useUserStatus = () => {
  const {
    onlineUsers,
    setUserOnline,
    setUserOffline,
    setUsersStatus,
    isUserOnline,
    getOnlineUsers,
    getOnlineUsersInRoom,
  } = useUserStatusStore();

  useEffect(() => {
    console.log('[useUserStatus] Hook initialized, connecting socket...');
    
    // Ensure socket is connected
    const socket = socketService.connect();
    
    if (!socket) {
      console.error('[useUserStatus] Failed to connect socket');
      return;
    }

    console.log('[useUserStatus] Socket found, setting up listeners...');

    // Setup listeners function
    const setupListeners = () => {
      console.log('[useUserStatus] Socket connected! Setting up listeners...');

      // Listen for user status changes
      const handleUserStatusChange = (data) => {
        const { userId, isOnline, lastSeen, ...metadata } = data;
        
        console.log('[useUserStatus] user_status_change event:', { userId, isOnline, lastSeen, metadata });
        
        if (isOnline) {
          setUserOnline(userId, { lastSeen, ...metadata });
        } else {
          setUserOffline(userId, { lastSeen, ...metadata });
        }

        console.log(`[useUserStatus] User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
      };

      // Listen for online users list (broadcast from server)
      const handleOnlineUsers = (users) => {
        console.log('[useUserStatus] online_users event received:', users);
        
        // Handle both array and object formats
        let usersArray;
        if (Array.isArray(users)) {
          usersArray = users;
        } else if (typeof users === 'object' && users !== null) {
          // Convert object to array
          usersArray = Object.values(users);
          console.log('[useUserStatus] Converted object to array:', usersArray);
        } else {
          console.error('[useUserStatus] online_users data is invalid:', users);
          return;
        }
        
        console.log('[useUserStatus] Setting users status, count:', usersArray.length);
        setUsersStatus(usersArray);
      };

      // Listen for room-specific online users
      const handleRoomOnlineUsers = (data) => {
        console.log('[useUserStatus] room_online_users event received:', data);
        
        const { room, users } = data;
        console.log(`[useUserStatus] Online users in room ${room}:`, users);
        
        if (Array.isArray(users)) {
          const usersWithRoom = users.map(u => ({ ...u, currentRoom: room }));
          console.log('[useUserStatus] Setting room users status:', usersWithRoom);
          setUsersStatus(usersWithRoom);
        } else {
          console.error('[useUserStatus] room_online_users.users is not an array:', users);
        }
      };

      socketService.onUserStatusChange(handleUserStatusChange);
      socketService.onOnlineUsers(handleOnlineUsers);
      socketService.onRoomOnlineUsers(handleRoomOnlineUsers);
    };

    // If already connected, setup immediately
    if (socket.connected) {
      console.log('[useUserStatus] Socket already connected');
      setupListeners();
    } else {
      // Wait for connection
      console.log('[useUserStatus] Waiting for socket connection...');
      socket.on('connect', setupListeners);
    }

    // Cleanup
    return () => {
      console.log('[useUserStatus] Cleaning up listeners');
      socket.off('connect', setupListeners);
      socketService.offUserStatusChange();
      socketService.offOnlineUsers();
      socketService.offRoomOnlineUsers();
    };
  }, [setUserOnline, setUserOffline, setUsersStatus]);

  return {
    onlineUsers,
    isUserOnline,
    getOnlineUsers,
    getOnlineUsersInRoom,
  };
};

export default useUserStatus;
