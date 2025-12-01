import React from 'react';
import { Users } from 'lucide-react';

const MainContent = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-base-200 p-4 text-center">
      {/* Ghost Image Placeholder */}
      <div className="mb-4 opacity-50">
        {/* Using SVG/Icon to simulate the ghost image in the screenshot */}
        <div className="w-[112px] h-[112px] flex items-center justify-center">
            <Users size={80} className="text-base-content/50" />
        </div>
      </div>
      
      {/* Text */}
      <span className="text-base-content/60 text-[20px] font-bold text-center max-w-[400px]">
        Select a person's name to preview their profile.
      </span>
    </div>
  );
};

export default MainContent;
