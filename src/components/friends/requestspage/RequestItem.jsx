import React from 'react';

const RequestItem = ({ name, avatarUrl, mutualFriends, time }) => {
  return (
    <div className="flex gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors relative group">
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
        <div className="flex justify-between items-start">
          <div className="pr-8"> {/* Padding right to avoid overlap with time */}
            <h3 className="text-[15px] font-semibold text-base-content leading-5">{name}</h3>
            <p className="text-[13px] text-base-content/60 mb-2 truncate">
              {mutualFriends > 0 ? `${mutualFriends} mutual friends` : '0 mutual friends'}
            </p>
          </div>
          {/* Time */}
          <span className="text-[12px] text-base-content/60 absolute top-2 right-2">{time}</span>
        </div>

        <div className="flex gap-2 mt-1">
          <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-content text-[15px] font-semibold py-[6px] rounded-[6px] transition-colors">
            Confirm
          </button>
          <button className="flex-1 bg-base-300 hover:bg-base-content/20 text-base-content text-[15px] font-semibold py-[6px] rounded-[6px] transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestItem;
