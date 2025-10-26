import React from "react";

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-t border-base-300">
      <div className="flex gap-2 px-6">
        <button 
          onClick={() => onTabChange("about")}
          className={`px-6 py-4 font-semibold transition-colors ${
            activeTab === "about" 
              ? "border-b-4 border-primary text-primary" 
              : "text-base-content/60 hover:bg-base-200"
          }`}
        >
          About
        </button>
        <button 
          onClick={() => onTabChange("friends")}
          className={`px-6 py-4 font-semibold transition-colors ${
            activeTab === "friends" 
              ? "border-b-4 border-primary text-primary" 
              : "text-base-content/60 hover:bg-base-200"
          }`}
        >
          Friends
        </button>
      </div>
    </div>
  );
};

export default ProfileTabs;
