import React from 'react';
import { ChevronRight } from 'lucide-react';

const SidebarItem = ({ 
  label, 
  Icon, 
  isActive = false, 
  hasChevron = false,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200
        ${isActive ? 'bg-base-200' : 'hover:bg-base-200/60'}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Icon Container */}
        <div className={`
          flex items-center justify-center w-9 h-9 rounded-full 
          ${isActive ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content group-hover:bg-base-content/20'}
        `}>
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
        </div>
        
        {/* Label */}
        <span className={`text-[17px] font-medium ${isActive ? 'text-base-content' : 'text-base-content'}`}>
          {label}
        </span>
      </div>

      {/* Chevron (Only if not active/home, typically) */}
      {hasChevron && (
        <ChevronRight size={20} className="text-base-content/60" />
      )}
    </div>
  );
};

export default SidebarItem;
