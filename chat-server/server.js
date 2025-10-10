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

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);

    // Initialize room if it doesn't exist
    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }

    // Send room history to the user who just joined
    socket.emit("room_history", {
      room: room,
      messages: roomMessages[room]
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
