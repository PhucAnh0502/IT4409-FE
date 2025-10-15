import React from 'react';

/**
 * Component to display user online/offline status indicator
 */
const UserStatusIndicator = ({ 
  isOnline, 
  size = 'sm', 
  showLabel = false,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full ${
            isOnline ? 'bg-success' : 'bg-base-300'
          }`}
        />
        {isOnline && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-success animate-ping opacity-75`}
          />
        )}
      </div>
      {showLabel && (
        <span className={`text-sm ${isOnline ? 'text-success' : 'text-base-content/50'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default UserStatusIndicator;
