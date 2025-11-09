import React from "react";
import { Edit2, Mail, Phone, FileText } from "lucide-react";
import EditableField from "./EditableField";

const ProfileInformationSection = ({ 
  profile, 
  editMode, 
  tempValues,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onTempValueChange
}) => {
  return (
    <div className="lg:col-span-2 flex">
      <div className="bg-base-100 rounded-xl shadow-md p-6 w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Profile Information
        </h2>
        
        <div className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              field="fullName"
              icon={Edit2}
              label="Full Name"
              value={profile.fullName}
              isEditing={editMode.fullName}
              tempValue={tempValues.fullName}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onTempValueChange={onTempValueChange}
            />
            <EditableField
              field="userName"
              icon={Edit2}
              label="Username"
              value={profile.userName}
              isEditing={editMode.userName}
              tempValue={tempValues.userName}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onTempValueChange={onTempValueChange}
            />
          </div>
          
          {/* Email */}
          <EditableField
            field="email"
            icon={Mail}
            label="Email"
            value={profile.email}
            isEditing={editMode.email}
            tempValue={tempValues.email}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onTempValueChange={onTempValueChange}
          />
          
          {/* Phone */}
          <EditableField
            field="phone"
            icon={Phone}
            label="Phone Number"
            value={profile.phone}
            isEditing={editMode.phone}
            tempValue={tempValues.phone}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onTempValueChange={onTempValueChange}
          />
          
          {/* Bio */}
          <EditableField
            field="bio"
            icon={FileText}
            label="Bio"
            value={profile.bio}
            isEditing={editMode.bio}
            tempValue={tempValues.bio}
            multiline={true}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onTempValueChange={onTempValueChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInformationSection;
