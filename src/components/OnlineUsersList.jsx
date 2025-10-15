import React from 'react';
import { Users } from 'lucide-react';
import UserStatusIndicator from './UserStatusIndicator';

/**
 * Component to display list of online users in a room
 */
const OnlineUsersList = ({ users = [], currentRoom = '' }) => {
  // DEBUG: Log props received
  console.log('[OnlineUsersList] Props received:', {
    users,
    usersLength: users?.length,
    currentRoom,
    usersArray: Array.isArray(users),
    usersIsEmpty: !users || users.length === 0
  });

  // Filter online users only
  const onlineUsersList = users.filter(u => u && u.isOnline);
  
  console.log('[OnlineUsersList] After filtering:', {
    originalCount: users.length,
    onlineCount: onlineUsersList.length,
    onlineUsers: onlineUsersList
  });

  if (!users || users.length === 0) {
    console.log('[OnlineUsersList] Showing "No users" message - users array is empty');
    return (
      <div className="text-center py-4 text-base-content/50">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No users online</p>
      </div>
    );
  }

  if (onlineUsersList.length === 0) {
    console.log('[OnlineUsersList] Showing "No online users" - all users are offline');
    return (
      <div className="text-center py-4 text-base-content/50">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No users currently online</p>
        <p className="text-xs mt-2">Total users: {users.length}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">
          Online Users ({onlineUsersList.length}/{users.length})
        </h3>
      </div>
      
      <div className="space-y-1">
        {users.map((user) => {
          console.log('[OnlineUsersList] Rendering user:', user);
          return (
            <div
              key={user.userId}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserStatusIndicator isOnline={user.isOnline} size="sm" />
                <div>
                  <p className="text-sm font-medium">
                    {user.username || `User ${user.userId.substring(0, 8)}`}
                  </p>
                  {user.lastSeen && !user.isOnline && (
                    <p className="text-xs text-base-content/50">
                      Last seen: {new Date(user.lastSeen).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              
              {user.currentRoom === currentRoom && currentRoom && (
                <span className="badge badge-primary badge-xs">In this room</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsersList;
