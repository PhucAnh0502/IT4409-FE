import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

const Sidebar = ({ 
  title,
  showBackButton = true,
  onBack,
  useNavigateBack = false,
  navigateBackPath = '/',
  searchPlaceholder = 'Search',
  dataList,
  ItemComponent,
  renderSubtitle,
  onItemClick,
  itemComponentProps = {}
}) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedItems, setDisplayedItems] = useState(dataList);

  // Filter logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setDisplayedItems(dataList);
      } else {
        const lower = searchQuery.toLowerCase();
        setDisplayedItems(dataList.filter(item => item.name.toLowerCase().includes(lower)));
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, dataList]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setDisplayedItems(dataList);
  };

  const handleBack = () => {
    if (useNavigateBack) {
      navigate(navigateBackPath);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full h-screen bg-base-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 h-[60px] border-b border-transparent">
        {!isSearchOpen ? (
          <>
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button 
                  onClick={handleBack}
                  className="hover:bg-base-200 p-2 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} className="text-base-content/60" />
                </button>
              )}
              <div>
                  <h1 className="text-2xl font-bold text-base-content leading-tight">{title}</h1>
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
                 placeholder={searchPlaceholder}
                 className="w-full bg-base-200 text-[15px] rounded-full py-2 pl-9 pr-4 outline-none focus:ring-0 text-base-content placeholder-base-content/50"
               />
            </div>
          </div>
        )}
      </div>

      {/* Subtitle Section */}
      {renderSubtitle && (
        <div className="px-4 pb-2 border-b border-base-300">
          {renderSubtitle(searchQuery, displayedItems)}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-4 scrollbar-thin">
        <div className="flex flex-col gap-2">
            {displayedItems.length > 0 ? (
              displayedItems.map(item => (
                  <ItemComponent 
                      key={item.id}
                      {...item}
                      {...itemComponentProps}
                      onClick={() => onItemClick && onItemClick(item)}
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
