import React, { useState, useEffect } from 'react';
import { Search, Home, UserPlus, Users, ArrowLeft } from 'lucide-react';
import SidebarItem from './SidebarItem';

const Sidebar = ({ onNavigate }) => {
  // Hardcoded data to match the screenshot exactly
  const initialItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      isActive: true,
      hasChevron: false,
    },
    {
      id: 'requests',
      label: 'Friend Requests',
      icon: UserPlus,
      isActive: false,
      hasChevron: true,
    },
    {
      id: 'all_friends',
      label: 'All Friends',
      icon: Users,
      isActive: false,
      hasChevron: true,
    },
  ];

  const [items, setItems] = useState(initialItems);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle active item selection
  const handleItemClick = (id) => {
    // Navigation Logic
    if (id === 'requests' && onNavigate) {
      onNavigate('requests');
      return;
    }
    
    if (id === 'all_friends' && onNavigate) {
      onNavigate('all_friends');
      return;
    }

    setItems(prevItems => prevItems.map(item => ({
      ...item,
      isActive: item.id === id
    })));
  };

  // Debounced Search Effect
  useEffect(() => {
    if (!isSearchOpen && searchQuery === '') {
       return;
    }

    const handler = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setItems(prev => {
           return initialItems.map(initItem => {
             const currentItem = prev.find(p => p.id === initItem.id);
             return { ...initItem, isActive: currentItem ? currentItem.isActive : initItem.isActive };
           });
        });
      } else {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = initialItems.filter(item => 
          item.label.toLowerCase().includes(lowerQuery)
        ).map(item => ({
          ...item,
          isActive: false 
        }));
        setItems(filtered);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, isSearchOpen]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setItems(initialItems); 
  };

  return (
    <div className="w-full max-w-[360px] bg-base-100 h-screen shadow-sm flex flex-col pt-2">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 pb-3 pt-2 h-[60px]">
        {!isSearchOpen ? (
          <>
            <h1 className="text-2xl font-bold text-base-content">Friends</h1>
            <button 
              onClick={handleOpenSearch}
              className="flex items-center justify-center w-9 h-9 bg-base-200 rounded-full hover:bg-base-300 transition-colors focus:outline-none"
              aria-label="Tìm kiếm"
            >
              <Search size={20} className="text-base-content" strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <div className="flex items-center w-full gap-2 animate-in fade-in duration-200">
            <button 
              onClick={handleCloseSearch}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-base-200 transition-colors text-base-content/60"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <input 
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends"
                className="w-full bg-base-200 text-[15px] rounded-full py-2 pl-9 pr-4 outline-none focus:ring-0 text-base-content placeholder-base-content/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="px-2 flex flex-col gap-1 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              Icon={item.icon}
              isActive={item.isActive}
              hasChevron={!item.isActive}
              onClick={() => handleItemClick(item.id)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-base-content/60 text-sm">
            No results found
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
