// Socket.IO Server Example for Room-Based Chat
// This file is for reference only - you need to create a separate Node.js project for the backend

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Store messages in memory (per room)
// In production, use a database like MongoDB, PostgreSQL, etc.
const roomMessages = {};

// Store online users and their info
const onlineUsers = {};
const roomUsers = {}; // Track which users are in which rooms

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Initialize user as online
  onlineUsers[socket.id] = {
    userId: socket.id,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    connectedAt: new Date().toISOString()
  };
  console.log('List of online users:', onlineUsers);

  // Broadcast to all clients that a new user is online
  io.emit("user_status_change", {
    userId: socket.id,
    isOnline: true,
    lastSeen: new Date().toISOString()
  });

  // Send list of all online users to the newly connected user
  socket.emit("online_users", Object.values(onlineUsers));
  
  // IMPORTANT: Broadcast updated online users list to ALL clients
  io.emit("online_users", Object.values(onlineUsers));
  console.log('[Server] Broadcasted online users to all clients:', Object.values(onlineUsers).length, 'users');

  // Handle user info update (optional: username, avatar, etc.)
  socket.on("user_info", (userInfo) => {
    if (onlineUsers[socket.id]) {
      onlineUsers[socket.id] = {
        ...onlineUsers[socket.id],
        ...userInfo
      };
      
      // Broadcast updated user info
      io.emit("user_status_change", {
        userId: socket.id,
        isOnline: true,
        ...onlineUsers[socket.id]
      });
    }
  });

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);

    // Track user's current room
    if (!roomUsers[room]) {
      roomUsers[room] = new Set();
    }
    roomUsers[room].add(socket.id);
    console.log(`Current users in room ${room}:`, Array.from(roomUsers[room]));

    // Update user's room info
    if (onlineUsers[socket.id]) {
      onlineUsers[socket.id].currentRoom = room;
    }
    console.log(`User ${socket.id} current room set to ${room}`);

    // Initialize room if it doesn't exist
    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }

    // Send room history to the user who just joined
    socket.emit("room_history", {
      room: room,
      messages: roomMessages[room]
    });

    // Send list of online users in this room
    const usersInRoom = Array.from(roomUsers[room] || [])
      .map(userId => onlineUsers[userId])
      .filter(Boolean);
    
    io.to(room).emit("room_online_users", {
      room: room,
      users: usersInRoom
    });
  });

  socket.on("get_room_history", (room) => {
    console.log(`User ${socket.id} requested history for room: ${room}`);
    
    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }

    // Send room history
    socket.emit("room_history", {
      room: room,
      messages: roomMessages[room]
    });
  });

  socket.on("leave_room", (room) => {
    socket.leave(room);
    console.log(`User with ID: ${socket.id} left room: ${room}`);

    // Remove user from room tracking
    if (roomUsers[room]) {
      roomUsers[room].delete(socket.id);
    }
    console.log(`Current users in room ${room}:`, Array.from(roomUsers[room] || []));

    // Update user's room info
    if (onlineUsers[socket.id]) {
      delete onlineUsers[socket.id].currentRoom;
    }
    console.log(`User ${socket.id} current room cleared`);

    // Notify remaining users in room
    const usersInRoom = Array.from(roomUsers[room] || [])
      .map(userId => onlineUsers[userId])
      .filter(Boolean);
    
    io.to(room).emit("room_online_users", {
      room: room,
      users: usersInRoom
    });
  });

  // Handle request for online users in a room
  socket.on("get_online_users", (room) => {
    const usersInRoom = Array.from(roomUsers[room] || [])
      .map(userId => onlineUsers[userId])
      .filter(Boolean);
    
    socket.emit("room_online_users", {
      room: room,
      users: usersInRoom
    });
  });

  socket.on("send_message", (data) => {
    console.log(`Message received in room ${data.room}: ${data.message} from ${socket.id}`);
    
    const timestamp = new Date().toLocaleTimeString();
    
    // Store message in room history
    const messageData = {
      message: data.message,
      room: data.room,
      sender: socket.id,
      timestamp: timestamp
    };

    if (!roomMessages[data.room]) {
      roomMessages[data.room] = [];
    }
    roomMessages[data.room].push(messageData);

    // Send message to all clients in room (EXCEPT sender)
    socket.to(data.room).emit("receive_message", messageData);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);

    // Mark user as offline
    if (onlineUsers[socket.id]) {
      onlineUsers[socket.id].isOnline = false;
      onlineUsers[socket.id].lastSeen = new Date().toISOString();

      // Broadcast user went offline
      io.emit("user_status_change", {
        userId: socket.id,
        isOnline: false,
        lastSeen: onlineUsers[socket.id].lastSeen
      });

      // IMPORTANT: Broadcast updated online users list to ALL clients
      io.emit("online_users", Object.values(onlineUsers));
      console.log('[Server] User disconnected, broadcasted updated list:', Object.values(onlineUsers).filter(u => u.isOnline).length, 'online users');

      // Remove from all rooms
      Object.keys(roomUsers).forEach(room => {
        if (roomUsers[room].has(socket.id)) {
          roomUsers[room].delete(socket.id);
          
          // Notify room users
          const usersInRoom = Array.from(roomUsers[room] || [])
            .map(userId => onlineUsers[userId])
            .filter(Boolean);
          
          io.to(room).emit("room_online_users", {
            room: room,
            users: usersInRoom
          });
          
          console.log(`[Server] Updated room ${room} online users:`, usersInRoom.length);
        }
      });
    }

    // Optional: Remove user after some time (keep for "last seen" feature)
    // setTimeout(() => {
    //   delete onlineUsers[socket.id];
    // }, 60000); // Remove after 1 minute
  });
});

server.listen(3001, () => {
  console.log("Socket.IO server is running on port 3001");
});

/* 
To run this server:
1. Create a new folder for backend: mkdir chat-server && cd chat-server
2. Initialize npm: npm init -y
3. Install dependencies: npm install express socket.io cors
4. Save this file as server.js
5. Run: node server.js
*/
