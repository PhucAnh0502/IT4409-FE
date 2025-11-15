import React, { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { X } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { getUserIdFromToken } from "../lib/utils";
import { getCroppedImg } from "../lib/imageHandler";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import ProfileInfo from "../components/profile/ProfileInfo";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfileInformationSection from "../components/profile/ProfileInformationSection";
import FriendsPreviewSection from "../components/profile/FriendsPreviewSection";
import AllFriendsSection from "../components/profile/AllFriendsSection";
import ChangePasswordSection from "../components/profile/ChangePasswordSection";

const ProfilePage = () => {
  // Get user store
  const { 
    friends: storeFriends, 
    isLoadingUser, 
    isLoadingFriends,
    isUpdatingUser,
    getUserById, 
    getUserFriends,
    updateUser 
  } = useUserStore();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("about"); // "about" or "friends"
  
  // User profile state
  const [profile, setProfile] = useState({
    avatarUrl: "https://ui-avatars.com/api/?name=Unknown&background=random",
    fullName: "Unknown",
    userName: "user",
    email: "no-email@example.com",
    bio: "No bio provided",
    phone: "No phone number"
  });

  // Use friends from store, fallback to empty array
  const friends = storeFriends || [];

  // Edit state
  const [editMode, setEditMode] = useState({
    fullName: false,
    userName: false,
    email: false,
    bio: false,
    phone: false
  });

  const [tempValues, setTempValues] = useState({});
  const fileInputRef = useRef(null);

  // Image Cropper States
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Crop complete callback
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Apply cropped image
  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels || !imageToCrop) return;
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Update profile with cropped image
      const updatedProfile = { ...profile, avatarUrl: croppedImage };
      setProfile(updatedProfile);
      
      // Close cropper modal
      setImageToCrop(null);
      setZoom(1);
      
      // Call API to save
      await getSyncedProfileData(updatedProfile);
    } catch (e) {
      console.error("Error cropping image:", e);
      toast.error("Could not crop the image. Please try another one.");
    }
  }, [croppedAreaPixels, imageToCrop, profile]);

  const getSyncedProfileData = async (updatedProfile) => {
    // Get userId from token
    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("Please login to update profile");
      return;
    }

    // Prepare data for API - use updated values
    const updateData = {
      userName: updatedProfile.userName,
      email: updatedProfile.email,
      fullName: updatedProfile.fullName,
      avatarUrl: updatedProfile.avatarUrl, // Map avatar to avatarUrl for API
      bio: updatedProfile.bio || "",
      phone: updatedProfile.phone || "",
    };
    
    const updatedUser = await updateUser(userId, updateData);
    
    // Sync state with API response to ensure consistency
    if (updatedUser) {
      setProfile({
        avatarUrl: updatedUser.avatarUrl || updatedProfile.avatarUrl,
        fullName: updatedUser.fullName || updatedProfile.fullName,
        userName: updatedUser.userName || updatedProfile.userName,
        email: updatedUser.email || updatedProfile.email,
        bio: updatedUser.bio || updatedProfile.bio,
        phone: updatedUser.phone || updatedProfile.phone
      });
    }
  }



  // Fetch user data on component mount
  useEffect(() => {
    // Get user ID from JWT token
    const userId = getUserIdFromToken();
    
    if (!userId) {
      toast.error("Please login to view profile");
      console.error("No user ID found in token");
      return;
    }
    
    // Fetch user profile data
    getUserById(userId).then((userData) => {
      // Map API response to profile state
      console.log("User data from API:", userData);
      if (userData) {
        setProfile({
          avatarUrl: userData.avatarUrl ||  `https://ui-avatars.com/api/?name=${userData.fullName || 'Unknown'}&background=random`,
          fullName: userData.fullName || "Unknown",
          userName: userData.userName || "user",
          email: userData.email || "no-email@example.com",
          bio: userData.bio || "No bio provided",
          phone: userData.phone || "No phone number"
        });
      }
    }).catch((error) => {
      console.error("Failed to fetch user data:", error);
    });

    // Fetch user friends list
    getUserFriends(userId).catch((error) => {
      console.error("Failed to fetch friends list:", error);
    });
  }, []);

  // Handle avatar change - just open cropper
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      // Use onFileChange utility to load image into cropper
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageToCrop(reader.result);
      });
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
  const saveEdit = async (field) => {
    if (tempValues[field]?.trim()) {
      const oldValue = profile[field];
      const newValue = tempValues[field];
      
      // Update UI immediately (optimistic update)
      const updatedProfile = { ...profile, [field]: newValue };
      setProfile(updatedProfile);
      setEditMode({ ...editMode, [field]: false });
      
      // Call API to update user
      try {
        await getSyncedProfileData(updatedProfile);
      } catch (error) {
        // Revert the change if API call fails
        setProfile(prev => ({ ...prev, [field]: oldValue }));
        console.error("Failed to update user:", error);
      }
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
      {/* Loading State */}
      {(isLoadingUser || isLoadingFriends || isUpdatingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] mx-4 bg-base-300 rounded-xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => {
                setImageToCrop(null);
                setZoom(1);
              }}
              className="absolute top-4 right-4 z-10 btn btn-circle btn-sm btn-ghost"
            >
              <X size={20} />
            </button>

            {/* Cropper */}
            <div className="relative w-full h-[calc(100%-80px)]">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-base-300 p-4 flex items-center gap-4">
              <label className="flex-1 flex items-center gap-2">
                <span className="text-sm">Zoom:</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="range range-primary range-sm flex-1"
                />
              </label>
              <button
                onClick={showCroppedImage}
                className="btn btn-primary"
              >
                Save Avatar
              </button>
            </div>
          </div>
        </div>
      )}

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
                avatar={profile.avatarUrl}
                fileInputRef={fileInputRef}
                onAvatarChange={handleAvatarChange}
              />
              
              <ProfileInfo 
                fullname={profile.fullName}
                userName={profile.userName}
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
          ) : activeTab === "friends" ? (
            /* Friends Tab Content - Full Friends List */
            <AllFriendsSection friends={friends} />
          ) : activeTab === "reset_password" ? (
            /* Change Password Tab Content */
            <ChangePasswordSection userId={getUserIdFromToken()} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
