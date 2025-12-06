import React from 'react';

const AddFriendItem = ({ 
  id,
  name, 
  avatarUrl, 
  message, // Message from friend request
  onCancelRequest,
  onClick // Add onClick prop
}) => {
  return (
    <div 
      onClick={onClick}
      className="flex gap-3 p-2 hover:bg-base-200 rounded-lg transition-colors items-center cursor-pointer"
    >
      {/* Avatar */}
      <div className="w-[60px] h-[60px] flex-shrink-0">
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full rounded-full object-cover border border-base-300"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[17px] font-semibold text-base-content leading-snug">{name}</h3>
        {message && (
          <p className="text-[13px] text-base-content/60 truncate italic">
            "{message}"
          </p>
        )}
      </div>

      {/* Cancel Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onCancelRequest(id); }}
        className="bg-base-300 hover:bg-base-content/20 text-base-content text-[15px] font-medium px-4 py-2 rounded-[6px] transition-colors whitespace-nowrap"
      >
        Cancel request
      </button>
    </div>
  );
};

export default AddFriendItem;
