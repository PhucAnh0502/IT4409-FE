import React, { useState } from "react";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/useAuthStore";

const ChangePasswordSection = ({ userId }) => {
  const { changePassword, isChangingPassword } = useAuthStore();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validatePasswords = () => {
    const newErrors = {};

    // Current Password - basic validation (will be verified by API)
    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    // New Password - same validation as SignUp
    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(passwords.newPassword)
    ) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, number, and special character";
    }

    // Confirm New Password
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check new password is different from current
    if (passwords.currentPassword && passwords.newPassword && 
        passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validatePasswords();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Call API to change password
      await changePassword({
        userId: userId,
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });

      // Clear form on success
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setErrors({});
    } catch (error) {
      console.error("Password change failed:", error);
      
      // Handle specific error cases
      if (error?.message?.includes("current password") || 
          error?.message?.includes("incorrect password") ||
          error?.message?.includes("wrong password") ||
          error?.message?.includes("old password")) {
        setErrors({
          currentPassword: "Current password is incorrect"
        });
      } else {
        toast.error(error?.message || "Failed to change password");
      }
    }
  };

  return (
    <div className="lg:col-span-2 flex">
      <div className="bg-base-100 rounded-xl shadow-md p-6 w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-primary" />
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-2">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-base-content/40" />
              </div>
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwords.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                className={`input input-bordered w-full pl-10 pr-10 ${
                  errors.currentPassword ? "input-error" : ""
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
                ) : (
                  <Eye className="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-error text-sm mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-base-content/40" />
              </div>
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwords.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                className={`input input-bordered w-full pl-10 pr-10 ${
                  errors.newPassword ? "input-error" : ""
                }`}
                placeholder="Enter new password (min 8 characters)"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
                ) : (
                  <Eye className="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-error text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-base-content/70 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-base-content/40" />
              </div>
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`input input-bordered w-full pl-10 pr-10 ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
                ) : (
                  <Eye className="w-5 h-5 text-base-content/40 hover:text-base-content/60" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto min-w-[200px]"
            >
              {isChangingPassword ? (
                <span className="loading loading-spinner mr-2"></span>
              ) : (
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  Change Password
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Helper Text */}
        <div className="mt-6 p-4 bg-base-200 rounded-lg">
          <p className="text-sm text-base-content/70">
            <strong>Password Requirements:</strong>
          </p>
          <ul className="list-disc list-inside text-sm text-base-content/60 mt-2 space-y-1">
            <li>At least 8 characters long</li>
            <li>Contains a mix of uppercase, lowercase, numbers, and special characters</li>
            <li>Different from your current password</li>
            <li>Keep your password secure and don't share it</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordSection;
