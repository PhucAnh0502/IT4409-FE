import React from "react";
import { Camera } from "lucide-react";

const ProfileAvatar = ({ avatar, fileInputRef, onAvatarChange }) => {
  return (
    <div className="relative group">
      <div className="avatar">
        <div className="w-40 h-40 rounded-full ring ring-base-100 ring-offset-base-200 ring-offset-4">
          <img src={avatar} alt="Profile" />
        </div>
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-2 right-2 btn btn-primary btn-circle btn-sm shadow-lg"
        title="Update profile picture"
      >
        <Camera className="w-4 h-4" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileAvatar;
