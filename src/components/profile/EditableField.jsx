import React from "react";
import { Edit2, X, Check } from "lucide-react";

const EditableField = ({ 
  field, 
  icon: Icon, 
  label, 
  value, 
  isEditing, 
  tempValue,
  multiline = false,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onTempValueChange
}) => {
  return (
    <div className="glass rounded-lg p-6 hover:bg-base-300/30 transition-all border border-base-300/50 backdrop-blur-lg bg-base-200/60">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-base-content/70">{label}</span>
        </div>
        {!isEditing && (
          <button
            onClick={() => onStartEdit(field)}
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
              value={tempValue || ""}
              onChange={(e) => onTempValueChange(field, e.target.value)}
              placeholder={`Enter your ${label.toLowerCase()}`}
              autoFocus
            />
          ) : (
            <input
              type={field === 'email' ? 'email' : 'text'}
              className="input input-bordered w-full"
              value={tempValue || ""}
              onChange={(e) => onTempValueChange(field, e.target.value)}
              placeholder={`Enter your ${label.toLowerCase()}`}
              autoFocus
            />
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => onCancelEdit(field)}
              className="btn btn-sm btn-ghost gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={() => onSaveEdit(field)}
              className="btn btn-sm btn-primary gap-2"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-base-content mt-2 ml-8">
          {value || `No ${label.toLowerCase()} provided`}
        </p>
      )}
    </div>
  );
};

export default EditableField;
