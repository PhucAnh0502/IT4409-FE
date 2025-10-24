import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import ProfileInfo from "../components/profile/ProfileInfo";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfileInformationSection from "../components/profile/ProfileInformationSection";
import FriendsPreviewSection from "../components/profile/FriendsPreviewSection";
import AllFriendsSection from "../components/profile/AllFriendsSection";

const ProfilePage = () => {
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("about"); // "about" or "friends"
  
  // User profile state
  const [profile, setProfile] = useState({
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    bio: "Software Engineer | Coffee Enthusiast | Travel Lover",
    phone: "+84 123 456 789"
  });

  // Friends list (mock data)
  const [friends, setFriends] = useState([
    {
      id: 1,
      avatar: "https://ui-avatars.com/api/?name=Alice+Smith&background=random",
      firstName: "Alice",
      lastName: "Smith",
      mutualFriends: 12
    },
    {
      id: 2,
      avatar: "https://ui-avatars.com/api/?name=Bob+Johnson&background=random",
      firstName: "Bob",
      lastName: "Johnson",
      mutualFriends: 8
    },
    {
      id: 3,
      avatar: "https://ui-avatars.com/api/?name=Carol+White&background=random",
      firstName: "Carol",
      lastName: "White",
      mutualFriends: 15
    },
    {
      id: 4,
      avatar: "https://ui-avatars.com/api/?name=David+Brown&background=random",
      firstName: "David",
      lastName: "Brown",
      mutualFriends: 6
    },
    {
      id: 5,
      avatar: "https://ui-avatars.com/api/?name=Emma+Davis&background=random",
      firstName: "Emma",
      lastName: "Davis",
      mutualFriends: 20
    },
    {
      id: 6,
      avatar: "https://ui-avatars.com/api/?name=Emma+Davis&background=random",
      firstName: "Ruud",
      lastName: "Vannisteroid",
      mutualFriends: 1
    },
    {
      id: 7,
      avatar: "https://ui-avatars.com/api/?name=Frank+Miller&background=random",
      firstName: "Frank",
      lastName: "Miller",
      mutualFriends: 9
    }
  ]);

  // Edit state
  const [editMode, setEditMode] = useState({
    firstName: false,
    lastName: false,
    email: false,
    bio: false,
    phone: false
  });

  const [tempValues, setTempValues] = useState({});
  const fileInputRef = useRef(null);

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
        toast.success("Avatar updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Start editing a field
  const startEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
    setTempValues({ ...tempValues, [field]: profile[field] });
  };

  // Cancel editing
  const cancelEdit = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setTempValues({ ...tempValues, [field]: "" });
  };

  // Save edited field
  const saveEdit = (field) => {
    if (tempValues[field]?.trim()) {
      setProfile({ ...profile, [field]: tempValues[field] });
      setEditMode({ ...editMode, [field]: false });
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } else {
      toast.error("Field cannot be empty");
    }
  };

  // Handle temp value change
  const handleTempValueChange = (field, value) => {
    setTempValues({ ...tempValues, [field]: value });
  };

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      {/* Cover Photo Section */}
      <div className="bg-gradient-to-r from-primary to-secondary h-64 relative">
       <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 pb-4">
            {/* Avatar and Name Section */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
              <ProfileAvatar 
                avatar={profile.avatar}
                fileInputRef={fileInputRef}
                onAvatarChange={handleAvatarChange}
              />
              
              <ProfileInfo 
                firstName={profile.firstName}
                lastName={profile.lastName}
                friendsCount={friends.length}
                friends={friends}
              />
            </div>
          </div>

          {/* Navigation tabs */}
          <ProfileTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Main Content */}
        <div className="mt-6 pb-8">
          {activeTab === "about" ? (
            /* About Tab Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Information */}
              <ProfileInformationSection 
                profile={profile}
                editMode={editMode}
                tempValues={tempValues}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onTempValueChange={handleTempValueChange}
              />

              {/* Right Column - Friends Preview */}
              <FriendsPreviewSection 
                friends={friends}
                onSeeAllClick={() => setActiveTab("friends")}
              />
            </div>
          ) : (
            /* Friends Tab Content - Full Friends List */
            <AllFriendsSection friends={friends} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
