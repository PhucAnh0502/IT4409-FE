# User Status System Documentation

## 📋 Overview

Hệ thống theo dõi trạng thái online/offline của users trong chat application sử dụng Socket.IO và Zustand store.

## 🏗️ Architecture

### Frontend Components

```
src/
├── stores/
│   └── useUserStatusStore.js      # Zustand store - Quản lý state global
├── hooks/
│   └── useUserStatus.js           # Custom React hook - Logic xử lý
├── components/
│   ├── UserStatusIndicator.jsx    # UI Badge hiển thị status
│   └── OnlineUsersList.jsx        # UI List users online
├── lib/
│   └── socket.js                  # Socket.IO service - API layer
└── pages/
    └── MessagePage.jsx            # Main chat UI - Integration
```

### Backend (chat-server/server.js)

```javascript
// Data structures
const onlineUsers = {};    // { userId: { isOnline, lastSeen, ... } }
const roomUsers = {};      // { roomId: Set([userId1, userId2, ...]) }
const roomMessages = {};   // { roomId: [...messages] }
```

## 🔄 Data Flow

### 1. User Connects
```
Client                    Server                    All Clients
  |                         |                           |
  |------ connect --------->|                           |
  |                         |--- user_status_change --->| (broadcast)
  |<---- online_users ------|                           |
```

### 2. User Joins Room
```
Client                    Server                    Room Clients
  |                         |                           |
  |---- join_room(id) ----->|                           |
  |                         |--- room_online_users ---->| (room broadcast)
  |<--- room_history -------|                           |
```

### 3. User Disconnects
```
Client                    Server                    All Clients
  |                         |                           |
  |------ disconnect ------>|                           |
  |                         |--- user_status_change --->| (broadcast)
  |                         |                           |
```

## 📡 Socket Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `user_info` | `{ username, avatar, ... }` | Cập nhật thông tin user |
| `join_room` | `roomId` | Tham gia phòng chat |
| `leave_room` | `roomId` | Rời khỏi phòng chat |
| `get_online_users` | `roomId` | Yêu cầu list users trong room |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `user_status_change` | `{ userId, isOnline, lastSeen }` | Thông báo status thay đổi |
| `online_users` | `[{ userId, isOnline, ... }]` | Danh sách tất cả users online |
| `room_online_users` | `{ room, users: [...] }` | Danh sách users trong room |

## 💾 State Management

### Zustand Store (useUserStatusStore)

```javascript
{
  // State
  onlineUsers: {
    'socketId1': { userId, isOnline, lastSeen, currentRoom, ... },
    'socketId2': { ... }
  },
  currentUser: { userId, username, ... },

  // Actions
  setUserOnline(userId, metadata)
  setUserOffline(userId, metadata)
  setUsersStatus(users)
  isUserOnline(userId)
  getOnlineUsers()
  getOnlineUsersInRoom(room)
}
```

## 🎨 UI Components

### UserStatusIndicator

Component hiển thị badge online/offline với animation.

**Props:**
- `isOnline` (boolean) - Trạng thái online/offline
- `size` ('xs' | 'sm' | 'md' | 'lg') - Kích thước badge
- `showLabel` (boolean) - Hiển thị text "Online"/"Offline"
- `className` (string) - CSS classes bổ sung

**Usage:**
```jsx
<UserStatusIndicator 
  isOnline={true} 
  size="sm" 
  showLabel={true} 
/>
```

### OnlineUsersList

Component hiển thị danh sách users với status.

**Props:**
- `users` (array) - Danh sách users
- `currentRoom` (string) - Room hiện tại (để highlight)

**Usage:**
```jsx
<OnlineUsersList 
  users={Object.values(onlineUsers)} 
  currentRoom={currentRoom}
/>
```

## 🔧 Implementation Guide

### Step 1: Initialize Status Store

Store tự động khởi tạo, không cần setup.

### Step 2: Use in Components

```jsx
import { useUserStatus } from '../hooks/useUserStatus';

function MyComponent() {
  const { onlineUsers, isUserOnline, getOnlineUsers } = useUserStatus();

  // Check if specific user is online
  const isJohnOnline = isUserOnline('john123');

  // Get all online users
  const allOnline = getOnlineUsers();

  return (
    <div>
      {Object.values(onlineUsers).map(user => (
        <UserStatusIndicator 
          key={user.userId}
          isOnline={user.isOnline}
        />
      ))}
    </div>
  );
}
```

### Step 3: Display in Chat

Status tự động hiển thị trong MessagePage:
- Badge bên cạnh user trong tin nhắn
- Sidebar "Online Users" (click button "X Online")
- Header hiển thị số lượng users online

## 🧪 Testing

### Test Scenario 1: Single User

1. Mở browser tab 1
2. Join room "test"
3. Kéo sidebar "Online Users" → Thấy 1 user (chính mình)

### Test Scenario 2: Multiple Users

1. Tab 1: Join room "test"
2. Tab 2: Join room "test"
3. Tab 1: Xem sidebar → Thấy 2 users online
4. Tab 2: Close tab
5. Tab 1: User 2 chuyển sang offline (badge đổi màu)

### Test Scenario 3: Cross-Room

1. Tab 1: Join "room1"
2. Tab 2: Join "room2"
3. Tab 1: Sidebar → Chỉ thấy users trong "room1"
4. Tab 3: Join "room1"
5. Tab 1: Sidebar update → Thấy thêm user mới

## 🚀 Advanced Features (Optional)

### 1. Database Persistence

Thay vì lưu trong memory, dùng database:

```javascript
// MongoDB example
const UserStatus = mongoose.model('UserStatus', {
  userId: String,
  isOnline: Boolean,
  lastSeen: Date,
  currentRoom: String
});

socket.on('connect', async () => {
  await UserStatus.updateOne(
    { userId: socket.id },
    { isOnline: true, lastSeen: new Date() },
    { upsert: true }
  );
});
```

### 2. Typing Indicators

```javascript
// Frontend
socket.emit('typing', { room: currentRoom, isTyping: true });

// Backend
socket.on('typing', (data) => {
  socket.to(data.room).emit('user_typing', {
    userId: socket.id,
    isTyping: data.isTyping
  });
});
```

### 3. Custom Status Messages

```javascript
// Store
setUserStatus(userId, 'online', { statusMessage: 'Working...' });

// UI
<p>{user.statusMessage || 'Online'}</p>
```

### 4. Away/Idle Detection

```javascript
// Frontend - Detect idle after 5 minutes
let idleTimer;
const resetIdleTimer = () => {
  clearTimeout(idleTimer);
  socket.emit('user_active');
  idleTimer = setTimeout(() => {
    socket.emit('user_idle');
  }, 5 * 60 * 1000);
};

document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);
```

## 🐛 Troubleshooting

### Users không hiển thị online

**Check:**
1. Socket server đang chạy?
2. Console có error?
3. useUserStatus() hook được gọi trong component?
4. Socket.IO CORS configured đúng?

### Status không update real-time

**Check:**
1. Socket events đang được emit/listen đúng?
2. Zustand store có được subscribe?
3. Component có re-render khi state change?

### Multiple tabs cùng user

Server tracks theo socketId, mỗi tab = 1 socket connection riêng.
Nếu muốn merge: Cần authentication và track theo userId thay vì socketId.

## 📚 Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hooks Best Practices](https://react.dev/reference/react)

## 🎯 Next Steps

1. ✅ Implement basic online/offline tracking
2. ✅ Show online users list
3. ✅ Display status in messages
4. 🔲 Add typing indicators
5. 🔲 Add user authentication
6. 🔲 Database persistence
7. 🔲 Away/Idle status
8. 🔲 Custom status messages

---

**Tác giả:** IT4409 Project Team  
**Ngày cập nhật:** October 2025
