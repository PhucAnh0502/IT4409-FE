import React from 'react';
import { X } from 'lucide-react';

// Mock data based on the screenshot
const SENT_REQUESTS = [
  {
    id: '1',
    name: 'Kuro Neko',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
    info: '2 mutual friends'
  },
  {
    id: '2',
    name: 'Saria Lucasso',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    info: '2 mutual friends'
  },
  {
    id: '3',
    name: 'Lưu Văn Cường',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    info: 'Has 13K followers'
  },
  {
    id: '4',
    name: 'Bàn Đăng Vuông',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    info: 'Has 2.4K followers'
  },
  {
    id: '5',
    name: 'Hồng Hạnh Nguyễn',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    info: '1 mutual friend'
  },
  {
    id: '6',
    name: 'Trần Văn A',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop',
    info: '12 mutual friends'
  }
];

const SentRequestsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm md:bg-black/40">
      {/* Modal Container */}
      <div className="bg-base-100 w-full h-full md:h-auto md:max-h-[80vh] md:w-[548px] md:rounded-lg shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="h-[60px] flex items-center justify-center border-b border-base-300 relative flex-shrink-0">
          <h2 className="text-[20px] font-bold text-base-content">Sent Requests</h2>
          <button 
            onClick={onClose}
            className="absolute right-4 w-9 h-9 bg-base-300 hover:bg-base-content/20 rounded-full flex items-center justify-center transition-colors text-base-content/70"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 md:flex-initial md:min-h-[400px]">
          <h3 className="font-semibold text-[17px] text-base-content mb-4">40 requests sent</h3>
          
          <div className="flex flex-col space-y-2">
            {SENT_REQUESTS.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded-lg transition-colors group">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-[60px] h-[60px] rounded-full object-cover border border-base-300"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[17px] text-base-content leading-snug">{user.name}</span>
                    <span className="text-[13px] text-base-content/60">{user.info}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="bg-base-300 hover:bg-base-content/20 text-base-content font-semibold px-4 py-2 rounded-md text-[15px] transition-colors whitespace-nowrap ml-4">
                  Cancel request
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentRequestsModal;
