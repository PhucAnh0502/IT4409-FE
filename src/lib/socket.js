import { io } from 'socket.io-client';

// Socket.IO service for managing connection and room-based messaging
class SocketService {
  constructor() {
    this.socket = null;
    this.url = 'http://localhost:3001';
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.url);
      console.log('Socket connecting...');
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  getSocket() {
    return this.socket;
  }

  // Join a chat room
  joinRoom(room) {
    if (this.socket && room) {
      this.socket.emit('join_room', room);
    }
  }

  // Leave a chat room
  leaveRoom(room) {
    if (this.socket && room) {
      this.socket.emit('leave_room', room);
    }
  }

  // Send message to a room
  sendMessage(room, message) {
    if (this.socket && room && message) {
      this.socket.emit('send_message', {
        room,
        message
      });
    }
  }

  // Listen for incoming messages
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  // Remove message listener
  offReceiveMessage() {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  // Listen for room history
  onRoomHistory(callback) {
    if (this.socket) {
      this.socket.on('room_history', callback);
    }
  }

  // Remove room history listener
  offRoomHistory() {
    if (this.socket) {
      this.socket.off('room_history');
    }
  }

  // Request room history
  getRoomHistory(room) {
    if (this.socket && room) {
      this.socket.emit('get_room_history', room);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
