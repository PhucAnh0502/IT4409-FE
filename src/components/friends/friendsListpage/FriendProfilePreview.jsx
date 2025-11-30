import React from 'react';
import { Mail, Phone, FileText, Calendar, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FriendProfilePreview = ({ profile, isLoading }) => {
  const navigate = useNavigate();

  // Handle message button click - navigate to chat page
  const handleMessageClick = () => {
    if (profile?.id) {
      navigate('/', { 
        state: { 
          startChatWithUserId: profile.id,
          friendName: profile.fullName || profile.userName
        } 
      });
    }
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Empty state - no friend selected (using original prettier design)
  if (!profile) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-base-200 p-4 text-center">
        {/* Ghost Image Placeholder */}
        <div className="mb-4 opacity-50">
          {/* Using SVG/Icon to simulate the image in the screenshot */}
          <div className="flex relative">
            <div className="w-[80px] h-[100px] bg-base-content/40 rounded-t-[40px] rounded-b-lg relative -mr-6 z-0 opacity-50 translate-y-2"></div>
            <div className="w-[112px] h-[140px] bg-base-content/50 rounded-t-[50px] rounded-b-xl z-10 flex flex-col items-center justify-end overflow-hidden">
              <div className="w-[50px] h-[50px] bg-primary rounded-full mb-2 absolute top-8 border-4 border-base-200"></div>
              <div className="w-full h-[60px] bg-base-content/50"></div>
            </div>
          </div>
        </div>
        
        {/* Text */}
        <span className="text-base-content/60 text-[20px] font-bold text-center max-w-[400px]">
          Select a friend to view their profile
        </span>
        <span className="text-base-content/40 text-sm mt-2">
          Select a person's name to preview their profile.
        </span>
      </div>
    );
  }

  // Profile view
  const displayAvatar = profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.userName || 'User')}&background=random`;

  return (
    <div className="h-full overflow-y-auto bg-base-200 p-6">
      {/* Avatar & Name Section */}
      <div className="bg-base-100 rounded-xl shadow-md p-8 mb-6">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="avatar">
            <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
              <img 
                src={displayAvatar}
                alt={profile.fullName || profile.userName} 
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.userName || 'User')}&background=random`;
                }}
              />
            </div>
          </div>
          
          {/* Name */}
          <h2 className="text-3xl font-bold mt-6 text-base-content">{profile.fullName || 'Unknown'}</h2>
          <p className="text-lg text-base-content/60 mt-1">@{profile.userName || 'unknown'}</p>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-base-100 rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Information
        </h3>
        
        <div className="space-y-5">
          {/* Email */}
          {profile.email && (
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-base-content/60 mb-1">Email</p>
                <p className="font-medium text-base-content break-all">{profile.email}</p>
              </div>
            </div>
          )}

          {/* Phone */}
          {profile.phone && (
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-base-content/60 mb-1">Phone Number</p>
                <p className="font-medium text-base-content">{profile.phone}</p>
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-base-content/60 mb-1">Bio</p>
                <p className="font-medium text-base-content whitespace-pre-wrap">{profile.bio}</p>
              </div>
            </div>
          )}

          {/* Member Since */}
          {profile.createdAt && (
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-base-content/60 mb-1">Member Since</p>
                <p className="font-medium text-base-content">
                  {new Date(profile.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="bg-base-100 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Actions</h3>
        <div className="flex gap-3">
          <button 
            className="btn btn-primary flex-1"
            onClick={handleMessageClick}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendProfilePreview;
