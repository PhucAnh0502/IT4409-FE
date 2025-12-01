import React from 'react';

const AddFriendItem = ({ 
  name, 
  avatarUrl, 
  mutualFriends,
  onAddFriend,
  onRemove
}) => {
  return (
    <div className="flex gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors relative group items-start">
      {/* Avatar */}
      <div className="w-[60px] h-[60px] flex-shrink-0">
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full rounded-full object-cover border border-base-300"
        />
      </div>

      {/* Info & Buttons */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <div className="mb-2"> 
            <h3 className="text-[17px] font-semibold text-base-content leading-snug">{name}</h3>
            <p className="text-[13px] text-base-content/60 truncate">
              {mutualFriends > 0 ? `${mutualFriends} mutual friends` : '0 mutual friends'}
            </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddFriend(); }}
            className="flex-1 bg-primary hover:bg-primary-focus text-primary-content text-[15px] font-semibold py-[6px] rounded-[6px] transition-colors whitespace-nowrap"
          >
            Add Friend
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="flex-1 bg-base-300 hover:bg-base-content/20 text-base-content text-[15px] font-semibold py-[6px] rounded-[6px] transition-colors whitespace-nowrap"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFriendItem;
