import React from 'react'

const ChatPage = () => {
    return (
        <div className="h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center px-5">
                <h2 className="text-xl font-semibold">Chat Room</h2>
                <div className="ml-auto">
                    <div className="badge badge-success badge-sm">Online</div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto bg-black space-y-4">
                {/* Other person's message */}
                <div className="chat chat-start">
                    <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-sm">Phuc Anh</span>
                        </div>
                    </div>
                    <div className="chat-header text-gray-400 text-sm mb-1">
                        User
                        <time className="text-xs opacity-50 ml-2">12:45</time>
                    </div>
                    <div className="chat-bubble chat-bubble-secondary">
                        Hello!
                    </div>
                </div>
                
                {/* My message */}
                <div className="chat chat-end">
                    <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-sm">Hoang</span>
                        </div>
                    </div>
                    <div className="chat-header text-gray-400 text-sm mb-1">
                        You
                        <time className="text-xs opacity-50 ml-2">12:46</time>
                    </div>
                    <div className="chat-bubble chat-bubble-primary">
                        Hello MU-1.5! This is a sample message.
                    </div>
                </div>

                {/* Another message */}
                <div className="chat chat-start">
                    <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-sm">Bach dam</span>
                        </div>
                    </div>
                    <div className="chat-bubble chat-bubble-secondary">
                        How are you doing today?
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="h-18 bg-gray-900 border-t border-gray-700 flex items-center px-5 py-3 gap-3">
                <input 
                    type="text" 
                    placeholder="Type a message..."
                    className="input input-bordered flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                />
                <button className="btn btn-primary btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default ChatPage


