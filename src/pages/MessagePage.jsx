import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, LogIn, LogOut } from 'lucide-react';
import { socketService } from '../lib/socket';

const MessagePage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomMessages, setRoomMessages] = useState({}); // Store messages per room
  const [room, setRoom] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to socket server
    socketService.connect();

    // Listen for incoming messages
    socketService.onReceiveMessage((data) => {
      const newMessage = {
        text: data.message,
        sender: data.sender,
        room: data.room,
        isOwn: false,
        timestamp: data.timestamp || new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, newMessage]);

      // Store in room history
      setRoomMessages((prev) => ({
        ...prev,
        [data.room]: [...(prev[data.room] || []), newMessage]
      }));
    });

    // Listen for room history
    socketService.onRoomHistory((data) => {
      const { room, messages: historyMessages } = data;
      
      // Format history messages
      const formattedHistory = historyMessages.map((msg) => ({
        text: msg.message,
        sender: msg.sender,
        room: msg.room,
        isOwn: msg.isOwn || false,
        timestamp: msg.timestamp
      }));

      // Set messages for display
      setMessages(formattedHistory);

      // Store in room history
      setRoomMessages((prev) => ({
        ...prev,
        [room]: formattedHistory
      }));
    });

    // Cleanup on unmount
    return () => {
      if (currentRoom) {
        socketService.leaveRoom(currentRoom);
      }
      socketService.offReceiveMessage();
      socketService.offRoomHistory();
      socketService.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (room.trim() !== '') {
      socketService.joinRoom(room);
      setCurrentRoom(room);
      setIsJoined(true);

      // Load cached messages if available
      if (roomMessages[room]) {
        setMessages(roomMessages[room]);
      } else {
        setMessages([
          {
            text: `You joined room: ${room}`,
            isSystem: true,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }

      // Request room history from server
      socketService.getRoomHistory(room);
    }
  };

  const leaveRoom = () => {
    if (currentRoom !== '') {
      // Save current messages to room history before leaving
      setRoomMessages((prev) => ({
        ...prev,
        [currentRoom]: messages
      }));

      socketService.leaveRoom(currentRoom);
      setCurrentRoom('');
      setIsJoined(false);
      setRoom('');
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (message.trim() && currentRoom) {
      const timestamp = new Date().toLocaleTimeString();
      
      socketService.sendMessage(currentRoom, message);
      
      const newMessage = {
        text: message,
        isOwn: true,
        timestamp: timestamp
      };

      // Add own message to chat
      setMessages((prev) => [...prev, newMessage]);

      // Store in room history
      setRoomMessages((prev) => ({
        ...prev,
        [currentRoom]: [...(prev[currentRoom] || []), newMessage]
      }));
      
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen container mx-auto px-4 pt-20 pb-6 max-w-5xl">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Real-Time Chat</h1>
          </div>
          <p className="text-base-content/60">
            Join a room and start chatting with others in real-time
          </p>
        </div>

        {/* Room Join Section */}
        {!isJoined ? (
          <div className="card bg-base-200 shadow-lg p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">Join a Room</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter room name or number..."
                className="input input-bordered flex-1"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
              />
              <button 
                className="btn btn-primary gap-2"
                onClick={joinRoom}
                disabled={!room.trim()}
              >
                <LogIn className="w-5 h-5" />
                Join Room
              </button>
            </div>
          </div>
        ) : (
          <div className="alert alert-info mb-4 shadow-lg">
            <div className="flex justify-between items-center w-full">
              <div>
                <span className="font-semibold">Current Room:</span>
                <span className="ml-2 badge badge-primary badge-lg">{currentRoom}</span>
              </div>
              <button 
                className="btn btn-sm btn-error gap-2"
                onClick={leaveRoom}
              >
                <LogOut className="w-4 h-4" />
                Leave Room
              </button>
            </div>
          </div>
        )}

        {/* Chat Area */}
        {isJoined && (
          <div className="flex-1 flex flex-col bg-base-100 rounded-lg shadow-lg overflow-hidden">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-base-content/50">
                  <p>Hãy bắt đầu cuộc trò chuyện ngay bây giờ!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index}>
                    {msg.isSystem ? (
                      <div className="text-center">
                        <span className="badge badge-ghost">{msg.text}</span>
                      </div>
                    ) : (
                      <div className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${msg.isOwn ? 'order-1' : 'order-2'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-md ${
                              msg.isOwn
                                ? 'bg-primary text-primary-content rounded-br-none'
                                : 'bg-base-200 rounded-bl-none'
                            }`}
                          >
                            {!msg.isOwn && msg.sender && (
                              <p className="text-xs opacity-70 mb-1">
                                User: {msg.sender.substring(0, 8)}
                              </p>
                            )}
                            <p className="break-words">{msg.text}</p>
                          </div>
                          <p
                            className={`text-xs mt-1 opacity-60 ${
                              msg.isOwn ? 'text-right' : 'text-left'
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-base-300 p-4 bg-base-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  className="input input-bordered flex-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="btn btn-primary gap-2"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {!isJoined && (
          <div className="flex-1 flex items-center justify-center bg-base-200 rounded-lg">
            <div className="text-center text-base-content/50">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Join a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
