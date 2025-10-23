import React, { useState, useRef } from "react";
import { useThemeStore } from "../stores/useThemeStore";
import { Camera, Edit2, Mail, Phone, FileText, Users, X, Check } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { theme } = useThemeStore();
  
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

  // Render editable field
  const renderEditableField = (field, icon, label, multiline = false) => {
    const Icon = icon;
    const isEditing = editMode[field];

    return (
      <div className="bg-base-200 rounded-lg p-6 hover:bg-base-300 transition-all border border-base-300">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-base-content/70">{label}</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => startEdit(field)}
              className="btn btn-ghost btn-sm btn-circle"
              title={`Edit ${label}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-3 space-y-3">
            {multiline ? (
              <textarea
                className="textarea textarea-bordered w-full"
                rows="3"
                value={tempValues[field] || ""}
                onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
                placeholder={`Enter your ${label.toLowerCase()}`}
                autoFocus
              />
            ) : (
              <input
                type={field === 'email' ? 'email' : 'text'}
                className="input input-bordered w-full"
                value={tempValues[field] || ""}
                onChange={(e) => setTempValues({ ...tempValues, [field]: e.target.value })}
                placeholder={`Enter your ${label.toLowerCase()}`}
                autoFocus
              />
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => cancelEdit(field)}
                className="btn btn-sm btn-ghost gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={() => saveEdit(field)}
                className="btn btn-sm btn-primary gap-2"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-base-content mt-2 ml-8">
            {profile[field] || `No ${label.toLowerCase()} provided`}
          </p>
        )}
      </div>
    );
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
              {/* Avatar with upload button */}
              <div className="relative group">
                <div className="avatar">
                  <div className="w-40 h-40 rounded-full ring ring-base-100 ring-offset-base-200 ring-offset-4">
                    <img src={profile.avatar} alt="Profile" />
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
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Name and basic info */}
              <div className="flex-1 text-center md:text-left mb-4">
                <h1 className="text-3xl font-bold text-base-content">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-base-content/60 mt-1">
                  {friends.length} friends
                </p>
                
                {/* Friend avatars preview */}
                <div className="flex justify-center md:justify-start gap-1 mt-3">
                  <div className="avatar-group -space-x-4">
                    {friends.slice(0, 5).map((friend) => (
                      <div key={friend.id} className="avatar border-2 border-base-100">
                        <div className="w-8 h-8">
                          <img src={friend.avatar} alt={friend.firstName} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="border-t border-base-300">
            <div className="flex gap-2 px-6">
              <button 
                onClick={() => setActiveTab("about")}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === "about" 
                    ? "border-b-4 border-primary text-primary" 
                    : "text-base-content/60 hover:bg-base-200"
                }`}
              >
                About
              </button>
              <button 
                onClick={() => setActiveTab("friends")}
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
        </div>

        {/* Main Content */}
        <div className="mt-6 pb-8">
          {activeTab === "about" ? (
            /* About Tab Content */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Information */}
              <div className="lg:col-span-2 flex">
                <div className="bg-base-100 rounded-xl shadow-md p-6 w-full">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Profile Information
                  </h2>
                  
                  <div className="space-y-4">
                    {/* First Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderEditableField("firstName", Edit2, "First Name")}
                      {renderEditableField("lastName", Edit2, "Last Name")}
                    </div>
                    
                    {/* Email */}
                    {renderEditableField("email", Mail, "Email")}
                    
                    {/* Phone */}
                    {renderEditableField("phone", Phone, "Phone Number")}
                    
                    {/* Bio */}
                    {renderEditableField("bio", FileText, "Bio", true)}
                  </div>
                </div>
              </div>

              {/* Right Column - Friends Preview */}
              <div className="flex">
                <div className="bg-base-100 rounded-xl shadow-md p-6 w-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Users className="w-6 h-6 text-primary" />
                      Friends
                    </h2>
                    <span className="text-base-content/60 text-sm">
                      {friends.length} friends
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 flex-1">
                    {friends.slice(0, 6).map((friend) => (
                      <div
                        key={friend.id}
                        className="bg-base-200 rounded-lg p-3 hover:bg-base-300 transition-all cursor-pointer group text-center flex flex-col items-center justify-center"
                      >
                        <div className="avatar mb-2 flex justify-center">
                          <div className="w-20 h-20 rounded-full">
                            <img src={friend.avatar} alt={friend.firstName} className="rounded-full" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm text-base-content group-hover:text-primary transition-colors truncate w-full">
                          {friend.firstName} {friend.lastName}
                        </h3>
                        <p className="text-xs text-base-content/60 mt-1">
                          {friend.mutualFriends} mutual friends
                        </p>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setActiveTab("friends")}
                    className="btn btn-outline btn-block mt-4"
                  >
                    See All Friends
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Friends Tab Content - Full Friends List */
            <div className="bg-base-100 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  All Friends
                </h2>
                <span className="text-base-content/60">
                  {friends.length} friends
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-base-200 rounded-lg p-4 hover:bg-base-300 transition-all cursor-pointer group text-center"
                  >
                    <div className="avatar mb-3 flex justify-center">
                      <div className="w-24 h-24 rounded-full">
                        <img src={friend.avatar} alt={friend.firstName} className="rounded-full" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm text-base-content group-hover:text-primary transition-colors truncate">
                      {friend.firstName} {friend.lastName}
                    </h3>
                    <p className="text-xs text-base-content/60 mt-1">
                      {friend.mutualFriends} mutual friends
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
