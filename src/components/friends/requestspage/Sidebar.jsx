import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import RequestItem from './RequestItem';
import SentRequestsModal from './SentRequestsModal';

// Mock data giả lập danh sách lời mời trong sidebar
const REQUESTS_LIST = [
  { id: '1', name: 'Hai Anh Le', mutualFriends: 1, time: '2 năm', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop' },
  { id: '2', name: 'Chi Linh', mutualFriends: 1, time: '5 năm', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop' },
  { id: '3', name: 'Tra My', mutualFriends: 0, time: '4 năm', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop' },
  { id: '4', name: 'Niels Abel', mutualFriends: 5, time: '4 năm', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop' },
  { id: '5', name: 'Van Mai', mutualFriends: 12, time: '1 tuần', avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop' },
  { id: '6', name: 'Nguyen Tuan', mutualFriends: 3, time: '2 ngày', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
];

const Sidebar = ({ onBack }) => {
  const [isSentModalOpen, setIsSentModalOpen] = useState(false);

  return (
    <>
      <div className="w-full h-screen bg-base-100 shadow-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-transparent">
          <button 
            onClick={onBack}
            className="hover:bg-base-200 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-base-content/60" />
          </button>
          <div>
              <span 
                onClick={onBack}
                className="text-[13px] text-base-content/60 block cursor-pointer hover:underline"
              >
                Friends
              </span>
              <h1 className="text-2xl font-bold text-base-content leading-tight">Friend Requests</h1>
          </div>
        </div>

        <div className="px-4 pb-2 border-b border-base-300">
          <h2 className="text-[20px] font-bold text-base-content">12 friend requests</h2>
          <button 
            onClick={() => setIsSentModalOpen(true)}
            className="text-[15px] text-primary hover:underline mt-1 block cursor-pointer bg-transparent border-none text-left p-0"
          >
            View sent requests
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pt-2 pb-4 scrollbar-thin">
          <div className="flex flex-col gap-2">
              {REQUESTS_LIST.map(req => (
                  <RequestItem 
                      key={req.id}
                      name={req.name}
                      avatarUrl={req.avatarUrl}
                      mutualFriends={req.mutualFriends}
                      time={req.time}
                  />
              ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <SentRequestsModal 
        isOpen={isSentModalOpen} 
        onClose={() => setIsSentModalOpen(false)} 
      />
    </>
  );
};

export default Sidebar;
