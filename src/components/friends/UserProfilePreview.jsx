import React from 'react';
import { Mail, User, MessageCircle, Phone, Calendar, MessageSquare } from 'lucide-react';

const UserProfilePreview = ({ userData, statusText = "Friend Request Sent · Waiting for response" }) => {
  if (!userData) return null;

  const {
    // Support both receiver* and sender* prefixes
    receiverFullName, senderFullName,
    receiverAvatar, senderAvatar,
    receiverEmail, senderEmail,
    receiverBio, senderBio,
    receiverPhone, senderPhone,
    receiverUserName, senderUserName,
    receiverCreatedAt, senderCreatedAt,
    message, // Message from friend request
    name,
    avatarUrl,
  } = userData;

  // Use receiver-specific or sender-specific data, with fallback to general data
  const displayName = receiverFullName || senderFullName || name || 'Unknown User';
  const displayAvatar = receiverAvatar || senderAvatar || avatarUrl || 'https://via.placeholder.com/150';
  const displayEmail = receiverEmail || senderEmail || 'No email provided';
  const displayBio = receiverBio || senderBio || 'No bio available';
  const displayPhone = receiverPhone || senderPhone || null;
  const displayUserName = receiverUserName || senderUserName || null;
  const displayMessage = message || null;
  
  // Format member since date
  const createdAt = receiverCreatedAt || senderCreatedAt;
  const displayMemberSince = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  return (
    <div className="w-full h-full bg-base-100 overflow-y-auto">
      {/* Top Banner with Avatar and Name */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-base-300">
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-xl flex-shrink-0">
              <img 
                src={displayAvatar} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name and Status */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-base-content mb-2">
                {displayName}
              </h1>
              {statusText && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <span className="text-base text-base-content/70">
                    {statusText}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Card */}
          {displayEmail && displayEmail !== 'No email provided' && (
            <div className="bg-base-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content/60 mb-2">Email Address</p>
                  <p className="text-lg text-base-content break-all">{displayEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Phone Card */}
          {displayPhone && (
            <div className="bg-base-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content/60 mb-2">Phone Number</p>
                  <p className="text-lg text-base-content">{displayPhone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Username Card */}
          {displayUserName && (
            <div className="bg-base-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content/60 mb-2">Username</p>
                  <p className="text-lg text-base-content">@{displayUserName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Member Since Card */}
          {displayMemberSince && (
            <div className="bg-base-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content/60 mb-2">Member Since</p>
                  <p className="text-lg text-base-content">{displayMemberSince}</p>
                </div>
              </div>
            </div>
          )}

          {/* Request Message Card - Full Width */}
          {displayMessage && (
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow md:col-span-2 border-l-4 border-primary">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content/60 mb-2">Request Message</p>
                  <p className="text-lg text-base-content leading-relaxed italic break-words whitespace-pre-wrap">
                    "{displayMessage}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bio Card - Full Width */}
          {displayBio && displayBio !== 'No bio available' && (
            <div className="bg-base-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content/60 mb-2">Bio</p>
                  <p className="text-lg text-base-content leading-relaxed">{displayBio}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State if no additional info */}
        {(!displayEmail || displayEmail === 'No email provided') && 
         (!displayBio || displayBio === 'No bio available') && 
         !displayPhone &&
         !displayUserName &&
         !displayMemberSince && (
          <div className="text-center py-12">
            <p className="text-base-content/50 text-lg">No additional information available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePreview;
