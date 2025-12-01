import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import AddFriendItem from './AddFriendItem';

// Mock Data matching the screenshot
const ADD_FRIEND_LIST = [
  { id: '1', name: 'Lâm Duy', mutualFriends: 13, avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop' },
  { id: '2', name: 'Nghĩa Dương', mutualFriends: 16, avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop' },
  { id: '3', name: 'Pham Gia', mutualFriends: 30, avatarUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop' },
  { id: '4', name: 'Kỳ Ninh', mutualFriends: 1, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
  { id: '5', name: 'Nguyen Van A', mutualFriends: 5, avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop' },
  { id: '6', name: 'Tran Thi B', mutualFriends: 2, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
];

const Sidebar = ({ onBack }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedFriends, setDisplayedFriends] = useState(ADD_FRIEND_LIST);

  // Filter logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setDisplayedFriends(ADD_FRIEND_LIST);
      } else {
        const lower = searchQuery.toLowerCase();
        setDisplayedFriends(ADD_FRIEND_LIST.filter(item => item.name.toLowerCase().includes(lower)));
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setDisplayedFriends(ADD_FRIEND_LIST);
  };

  return (
    <div className="w-full h-full bg-base-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 h-[60px] border-b border-transparent">
        {!isSearchOpen ? (
          <>
            <div className="flex items-center gap-3">
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
                  <h1 className="text-2xl font-bold text-base-content leading-tight">Add Friends</h1>
              </div>
            </div>
            
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center bg-base-200 hover:bg-base-300 rounded-full transition-colors"
            >
              <Search size={20} className="text-base-content" />
            </button>
          </>
        ) : (
          /* Search Input Mode */
          <div className="flex items-center w-full gap-2 animate-in fade-in duration-200">
             <button 
              onClick={handleCloseSearch}
              className="hover:bg-base-200 p-2 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-base-content/60" />
            </button>
            <div className="flex-1 relative">
               <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
               <input 
                 autoFocus
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search people"
                 className="w-full bg-base-200 text-[15px] rounded-full py-2 pl-9 pr-4 outline-none focus:ring-0 text-base-content placeholder-base-content/50"
               />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-2 border-b border-base-300">
        <h2 className="text-[17px] font-semibold text-base-content">
          {searchQuery ? `Search Results` : 'People You May Know'}
        </h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-4 scrollbar-thin">
        <div className="flex flex-col gap-2">
            {displayedFriends.length > 0 ? (
              displayedFriends.map(item => (
                  <AddFriendItem 
                      key={item.id}
                      name={item.name}
                      avatarUrl={item.avatarUrl}
                      mutualFriends={item.mutualFriends}
                      onAddFriend={() => console.log('Add', item.name)}
                      onRemove={() => console.log('Remove', item.name)}
                  />
              ))
            ) : (
              <div className="p-4 text-center text-base-content/60 text-sm">
                No results found
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
