import React from 'react';
import { MessageCircle, XSquare, UserX, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContextMenu = ({ friendName, friendUserId, onClose, style }) => {
  const navigate = useNavigate();
  
  // Prevent click from closing the menu immediately when clicking inside
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  // Handle message click - navigate to chat page
  const handleMessageClick = () => {
    if (friendUserId) {
      // Navigate to HomePage (chat page) with state containing friendUserId
      // The HomePage/Sidebar will handle creating/finding the conversation
      navigate('/', { 
        state: { 
          startChatWithUserId: friendUserId,
          friendName: friendName 
        } 
      });
      onClose();
    }
  };

  return (
    <>
      {/* Invisible Overlay to handle click outside */}
      <div 
        className="fixed inset-0 z-40 cursor-default" 
        onClick={onClose}
      />

      {/* Menu Container */}
      <div 
        style={style}
        className="fixed z-50 w-[340px] bg-base-100 rounded-lg shadow-2xl py-2 border border-base-300 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
        onClick={handleMenuClick}
      >
        {/* Nhắn tin */}
        <div 
          className="flex items-center px-2 py-2 mx-2 hover:bg-base-200 rounded-md cursor-pointer transition-colors"
          onClick={handleMessageClick}
        >
          <MessageCircle size={24} className="text-base-content mr-3" />
          <div>
            <span className="block text-[15px] font-medium text-base-content">Message {friendName.split(' ').pop()}</span>
          </div>
        </div>

        {/* Bỏ theo dõi */}
        <div className="flex items-start px-2 py-2 mx-2 hover:bg-base-200 rounded-md cursor-pointer transition-colors mt-1">
          <div className="mt-1 mr-3">
             <XSquare size={24} className="text-base-content" />
          </div>
          <div>
            <span className="block text-[15px] font-medium text-base-content">Unfollow {friendName.split(' ').pop()}</span>
            <span className="block text-[12px] text-base-content/60 leading-4 mt-0.5">
              Stop seeing posts but still friends. They won't be notified.
            </span>
          </div>
        </div>

        {/* Chặn */}
        <div className="flex items-start px-2 py-2 mx-2 hover:bg-base-200 rounded-md cursor-pointer transition-colors mt-1">
          <div className="mt-1 mr-3">
             <Ban size={24} className="text-base-content" />
          </div>
          <div>
            <span className="block text-[15px] font-medium text-base-content">Block {friendName.split(' ').pop()}</span>
            <span className="block text-[12px] text-base-content/60 leading-4 mt-0.5">
              {friendName.split(' ').pop()} won't be able to see you or contact you on Facebook.
            </span>
          </div>
        </div>

        {/* Hủy kết bạn */}
        <div className="flex items-start px-2 py-2 mx-2 hover:bg-base-200 rounded-md cursor-pointer transition-colors mt-1">
           <div className="mt-1 mr-3">
             <UserX size={24} className="text-base-content" />
           </div>
          <div>
            <span className="block text-[15px] font-medium text-base-content">Unfriend {friendName.split(' ').pop()}</span>
            <span className="block text-[12px] text-base-content/60 leading-4 mt-0.5">
              Remove {friendName.split(' ').pop()} from your friends list.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContextMenu;
