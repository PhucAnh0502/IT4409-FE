import React from 'react';

const FriendCard = ({
  name,
  avatarUrl,
  mutualFriends,
  onConfirm,
  onDelete,
}) => {
  return (
    <div className="bg-base-100 rounded-lg overflow-hidden border border-base-300 hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Avatar Image */}
      <div className="aspect-square w-full overflow-hidden bg-base-200 cursor-pointer">
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="font-semibold text-[17px] text-base-content leading-tight cursor-pointer hover:underline truncate">
            {name}
          </h3>
          <p className="text-[13px] text-base-content/60 mt-1">
            {mutualFriends > 0 ? `${mutualFriends} mutual friends` : '0 mutual friends'}
          </p>
        </div>

        {/* Buttons - Push to bottom */}
        <div className="mt-auto space-y-2">
          <button
            onClick={onConfirm}
            className="w-full py-[6px] px-3 bg-primary hover:bg-primary/90 text-primary-content font-semibold rounded-md text-[15px] transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onDelete}
            className="w-full py-[6px] px-3 bg-base-300 hover:bg-base-content/20 text-base-content font-semibold rounded-md text-[15px] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
