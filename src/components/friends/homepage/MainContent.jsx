import React from 'react';
import FriendCard from './FriendCard';

// Mock data giả lập danh sách bạn bè
const FRIEND_REQUESTS = [
  {
    id: '1',
    name: 'Hai Anh Le',
    mutualFriends: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Chi Linh',
    mutualFriends: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Tra My',
    mutualFriends: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Niels Abel',
    mutualFriends: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Van Mai',
    mutualFriends: 12,
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Nguyen Tuan',
    mutualFriends: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    id: '7',
    name: 'Tran Bao',
    mutualFriends: 8,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: '8',
    name: 'Le Thu',
    mutualFriends: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  }
];

const MainContent = ({ onNavigate }) => {
  return (
    <div className="p-4 md:p-8 w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-base-content">Friend Requests</h2>
        <button 
          onClick={() => onNavigate && onNavigate('requests')}
          className="text-primary text-[15px] hover:bg-base-200 px-2 py-1 rounded transition-colors cursor-pointer"
        >
          See all
        </button>
      </div>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {FRIEND_REQUESTS.map((friend) => (
          <FriendCard
            key={friend.id}
            id={friend.id}
            name={friend.name}
            avatarUrl={friend.avatarUrl}
            mutualFriends={friend.mutualFriends}
            onConfirm={() => console.log('Confirmed', friend.name)}
            onDelete={() => console.log('Deleted', friend.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default MainContent;
