# Debug Guide - Online Users Display Issue

## 🔍 Debug Console Logs Added

Tôi đã thêm nhiều console.log statements để theo dõi flow của data từ server → hook → store → component.

### Console Log Tags

Tất cả logs được prefix với tag để dễ filter:

- `[useUserStatusStore]` - Zustand store operations
- `[useUserStatus]` - Hook lifecycle và events
- `[MessagePage - *]` - MessagePage component renders
- `[OnlineUsersList]` - OnlineUsersList component renders

---

## 🧪 Testing Steps

### 1. **Mở Browser Console** (F12)

Chọn tab "Console" và filter để chỉ xem logs của app:
- Click icon "Filter" (funnel)
- Hoặc type prefix vào search: `[useUserStatus]`

### 2. **Reload Page và Join Room**

```
Expected Console Output Flow:
┌─────────────────────────────────────────────────────┐
│ 1. Page Load                                        │
│    [useUserStatus] Setting up listeners            │
│    [useUserStatus] online_users event received     │
│    [useUserStatusStore] setUsersStatus called       │
│                                                      │
│ 2. Join Room                                        │
│    [useUserStatus] room_online_users event          │
│    [useUserStatusStore] setUsersStatus called       │
│    [MessagePage - Room Header] Online users count   │
│    [OnlineUsersList] Props received                 │
│    [OnlineUsersList] After filtering                │
└─────────────────────────────────────────────────────┘
```

### 3. **Check Each Log Point**

#### A. When Socket Connects
```javascript
// You should see:
[useUserStatus] Setting up listeners
[useUserStatus] user_status_change event: { userId: "abc123", isOnline: true, ... }
[useUserStatusStore] setUserStatus called: { userId: "abc123", isOnline: true }
[useUserStatusStore] New state after setUserStatus: { onlineUsers: { ... } }
```

#### B. When You Join Room
```javascript
// You should see:
[useUserStatus] room_online_users event received: { room: "1", users: [...] }
[useUserStatusStore] setUsersStatus called with: [{ userId, isOnline, ... }]
[useUserStatusStore] New onlineUsers after setUsersStatus: { ... }
```

#### C. When Component Renders
```javascript
// MessagePage Header:
[MessagePage - Room Header] Online users count: {
  onlineUsers: { "abc123": {...}, "def456": {...} },
  onlineCount: 2,
  currentRoom: "1"
}

// OnlineUsersList:
[OnlineUsersList] Props received: {
  users: [{...}, {...}],
  usersLength: 2,
  currentRoom: "1",
  usersArray: true,
  usersIsEmpty: false
}

[OnlineUsersList] After filtering: {
  originalCount: 2,
  onlineCount: 2,
  onlineUsers: [{...}, {...}]
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: `onlineUsers` is Empty Object `{}`

**Symptoms:**
```javascript
[MessagePage] onlineUsersObject: {}
[OnlineUsersList] usersLength: 0
```

**Possible Causes:**
1. Socket not connected
2. Events not being received
3. Store not updating

**Debug:**
```javascript
// Check socket connection:
[useUserStatus] No socket found  ❌ (BAD)
[useUserStatus] Setting up listeners  ✅ (GOOD)

// Check if events are received:
[useUserStatus] online_users event received: [...]  ✅ (GOOD)
// vs
// (No event logs)  ❌ (BAD - server not sending)
```

**Solution:**
- If no socket: Check if `socketService.connect()` is called in MessagePage useEffect
- If no events: Check server logs, ensure server is running

---

### Issue 2: Events Received But Store Not Updating

**Symptoms:**
```javascript
[useUserStatus] online_users event received: [{ userId: "abc", isOnline: true }]
[useUserStatusStore] setUsersStatus called with: [...]
// But:
[MessagePage] onlineUsersObject: {}  ❌
```

**Possible Cause:**
- Zustand store subscription issue
- Component not re-rendering

**Debug:**
```javascript
// Check store update logs:
[useUserStatusStore] New onlineUsers after setUsersStatus: {
  "abc123": { userId: "abc123", isOnline: true }
}  ✅ Store IS updating

// If store updates but component doesn't show:
// Component may not be subscribed correctly
```

**Solution:**
Check if `useUserStatus()` hook is called in component:
```javascript
const { onlineUsers } = useUserStatus(); // ✅ Must be at component top level
```

---

### Issue 3: Users Array Has Data But Shows "0 Online"

**Symptoms:**
```javascript
[OnlineUsersList] Props received: {
  usersLength: 2,  // Has users!
  onlineCount: 0   // But count is 0?
}
```

**Possible Cause:**
- Users exist but `isOnline: false`
- Filter removing all users

**Debug:**
```javascript
[OnlineUsersList] After filtering: {
  originalCount: 2,
  onlineCount: 0,  // All filtered out
  onlineUsers: []
}

// Check individual users:
[OnlineUsersList] Rendering user: {
  userId: "abc",
  isOnline: false  ❌ Should be true
}
```

**Solution:**
Check server - is it setting `isOnline: true`?
```javascript
// Server should send:
{
  userId: socket.id,
  isOnline: true,  // ✅ Must be true
  lastSeen: "..."
}
```

---

### Issue 4: Room Users vs Global Users Confusion

**Symptoms:**
- Global sidebar shows users
- Room sidebar shows "0 users"

**Debug:**
```javascript
// Global sidebar (should show ALL users):
[MessagePage - Join Screen] allUsersArray: [
  { userId: "abc", isOnline: true, currentRoom: undefined },
  { userId: "def", isOnline: true, currentRoom: undefined }
]

// Room sidebar (should show room-specific):
[MessagePage - Room Sidebar] Users data: {
  roomUsers: [],  // Empty! ❌
  currentRoom: "1"
}
```

**Cause:**
- `currentRoom` field not being set on users
- Server not sending `currentRoom` in user object

**Solution:**
Check if `room_online_users` event includes room info:
```javascript
// Hook should set currentRoom:
const usersWithRoom = users.map(u => ({ 
  ...u, 
  currentRoom: room  // ✅ Add this
}));
```

---

## 📋 Debug Checklist

Use this checklist when debugging:

```
□ Server is running (node server.js)
□ Frontend dev server is running (npm run dev)
□ Browser console is open (F12)
□ Console shows no errors (red text)

Socket Connection:
□ [useUserStatus] Setting up listeners ✓
□ [useUserStatus] online_users event received ✓

Store Updates:
□ [useUserStatusStore] setUsersStatus called ✓
□ [useUserStatusStore] New onlineUsers has data ✓

Component Rendering:
□ [MessagePage] onlineUsersObject is not empty {} ✓
□ [OnlineUsersList] usersLength > 0 ✓
□ [OnlineUsersList] onlineCount > 0 ✓

UI Display:
□ Header shows "X Online" with X > 0 ✓
□ Sidebar shows user list ✓
□ Users have green/gray badges ✓
```

---

## 🔧 Quick Fixes

### Fix 1: Force Refresh Store

If store seems stuck, add this to MessagePage:

```javascript
useEffect(() => {
  // Force request online users when component mounts
  const socket = socketService.getSocket();
  if (socket && socket.connected) {
    console.log('[DEBUG] Requesting online users list');
    socket.emit('get_all_online_users'); // Add this to server
  }
}, []);
```

### Fix 2: Manual State Check

Add temporary button to MessagePage for debugging:

```jsx
<button onClick={() => {
  console.log('[DEBUG] Current state:', {
    onlineUsers,
    keys: Object.keys(onlineUsers),
    values: Object.values(onlineUsers)
  });
}}>
  Debug State
</button>
```

### Fix 3: Reset Store

If data gets corrupted:

```javascript
import { useUserStatusStore } from '../stores/useUserStatusStore';

// In component:
const clearUsers = useUserStatusStore(state => state.clearUsers);

// Call when needed:
clearUsers();
```

---

## 📊 Expected vs Actual Comparison

### Scenario: 2 Tabs Join Same Room

**Expected Logs:**

```
Tab 1:
[useUserStatus] user_status_change: { userId: "tab1-id", isOnline: true }
[MessagePage - Room Header] onlineCount: 1

Tab 2:
[useUserStatus] user_status_change: { userId: "tab2-id", isOnline: true }

Tab 1 (auto-update):
[useUserStatus] user_status_change: { userId: "tab2-id", isOnline: true }
[MessagePage - Room Header] onlineCount: 2  ✅

Tab 2:
[useUserStatus] room_online_users: { room: "1", users: [tab1, tab2] }
[MessagePage - Room Header] onlineCount: 2  ✅
```

**If Seeing:**

```
Tab 1:
[MessagePage - Room Header] onlineCount: 0  ❌

Tab 2:
[MessagePage - Room Header] onlineCount: 0  ❌
```

**Then:**
- Store not updating (check store logs)
- Events not received (check hook logs)
- Server not sending events (check server logs)

---

## 🎯 Next Steps

1. **Run the app:**
   ```powershell
   # Terminal 1:
   cd chat-server
   node server.js
   
   # Terminal 2:
   npm run dev
   ```

2. **Open browser console (F12)**

3. **Follow the flow:**
   - Load page → Check `[useUserStatus] Setting up listeners`
   - Join room → Check `[useUserStatus] room_online_users event`
   - See if store updates → Check `[useUserStatusStore] New onlineUsers`
   - See if component renders → Check `[OnlineUsersList] Props received`

4. **Report findings:**
   - Copy all console logs
   - Note which step fails
   - Check server logs for corresponding events

---

**Updated:** October 15, 2025  
**Status:** Debug logs active, ready for testing
