import React from 'react';

const MainContent = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-base-200 p-4 text-center">
      {/* Ghost Image Placeholder */}
      <div className="mb-4 opacity-50">
         {/* Simulate the group icon/ghost image */}
         <div className="flex relative items-end justify-center">
            {/* Back figure */}
            <div className="w-[60px] h-[70px] bg-base-content/40 rounded-t-[30px] rounded-b-md absolute -left-4 z-0 opacity-60"></div>
            {/* Front figure */}
            <div className="w-[80px] h-[90px] bg-base-content/50 rounded-t-[40px] rounded-b-lg z-10 flex flex-col items-center justify-start overflow-hidden pt-4">
                <div className="w-[30px] h-[30px] bg-primary rounded-full border-2 border-base-200"></div>
            </div>
             {/* Right figure */}
             <div className="w-[50px] h-[60px] bg-base-content/40 rounded-t-[25px] rounded-b-md absolute -right-3 z-0 opacity-60"></div>
         </div>
      </div>
      
      {/* Text */}
      <span className="text-base-content/60 text-[20px] font-bold text-center max-w-[400px]">
        Select someone's name to preview their profile.
      </span>
    </div>
  );
};

export default MainContent;
