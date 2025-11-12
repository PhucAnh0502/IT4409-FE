import React, { useCallback, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  User,
  Loader2,
  X,
  Check,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import { getCroppedImg } from "../lib/imageHandler";
import { useAuthStore } from "../stores/useAuthStore";
import Cropper from "react-easy-crop";
import { onFileChange, handleInputChange } from "../lib/utils";

const SignUpPage = () => {
  //Validate States and Handlers
  const { signUp, isSigningUp } = useAuthStore();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Image Cropper States and Handlers
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  //Form Data State
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "https://tse3.mm.bing.net/th/id/OIP.JkmDH-OEW5dZYiLe1XgLiQHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
    bio: "",
    phone: "",
  });

  const validateForm = () => {
    const errors = {};

    // Full Name
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (/\d/.test(formData.fullName)) {
      errors.fullName = "Full name cannot contain numbers";
    }

    // User Name
    if (!formData.userName.trim()) {
      errors.userName = "Username is required";
    } else if (/\s/.test(formData.userName)) {
      errors.userName = "Username cannot contain spaces";
    } else if (formData.userName.length < 3) {
      errors.userName = "Username must be at least 3 characters";
    }

    // Email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      errors.password =
        "Password must contain uppercase, lowercase, number, and special character";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Phone
    if (formData.phone.trim() && !/^\d{10,11}$/.test(formData.phone)) {
      errors.phone = "Invalid phone number format";
    }

    return errors;
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels || !imageToCrop) return;
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setFormData({ ...formData, avatarUrl: croppedImage });
      setImageToCrop(null);
      setZoom(1);
    } catch (e) {
      console.error(e);
      setErrors({
        ...errors,
        avatarUrl: "Could not crop the image. Please try another one.",
      });
    }
  }, [croppedAreaPixels, imageToCrop, formData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});
    console.log("Form Data Submitted: ", formData);
    signUp(formData);
  };

  return (
    <div className="min-h-full bg-base-200 font-sans">
      {/* Cropper Modal */}
      {imageToCrop && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg h-96 rounded-lg overflow-hidden">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
            />
          </div>
          <div className="w-full max-w-lg mt-4">
            <label className="text-white text-sm">Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="range range-primary range-xs"
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setImageToCrop(null)}
              className="btn btn-outline btn-error"
            >
              <X className="size-5 mr-1" /> Cancel
            </button>
            <button className="btn btn-success" onClick={showCroppedImage}>
              <Check className="size-5 mr-1" /> Apply
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left Side */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
                <h1 className="text-2xl font-bold mt-2">Create Account</h1>
                <p className="text-base-content/60">
                  Get started with your free account
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-3">
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={
                        formData.avatarUrl || "../../public/default_avatar.jpg"
                      }
                      alt="Avatar Preview"
                    />
                  </div>
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="btn btn-sm btn-outline btn-primary"
                >
                  <Upload className="size-4 mr-2" />
                  Upload Photo
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange(setImageToCrop)}
                  className="hidden"
                />
                {errors.avatarUrl && (
                  <p className="text-error text-xs mt-1">{errors.avatarUrl}</p>
                )}
              </div>
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="form-control">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="size-5 text-base-content/40" />
                    </div>
                    <input
                      name="fullName"
                      placeholder="Full Name"
                      className={`input input-bordered w-full pl-10 ${
                        errors.fullName ? "input-error" : ""
                      }`}
                      value={formData.fullName}
                      onChange={handleInputChange(setFormData, setErrors)}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-error text-xs mt-1 ml-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>
                {/* User Name */}
                <div className="form-control">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="size-5 text-base-content/40" />
                    </div>
                    <input
                      name="userName"
                      placeholder="Username"
                      className={`input input-bordered w-full pl-10 ${
                        errors.userName ? "input-error" : ""
                      }`}
                      value={formData.userName}
                      onChange={handleInputChange(setFormData, setErrors)}
                    />
                  </div>
                  {errors.userName && (
                    <p className="text-error text-xs mt-1 ml-1">
                      {errors.userName}
                    </p>
                  )}
                </div>
              </div>
              {/* Email */}
              <div className="form-control">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base-content/40" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className={`input input-bordered w-full pl-10 ${
                      errors.email ? "input-error" : ""
                    }`}
                    value={formData.email}
                    onChange={handleInputChange(setFormData, setErrors)}
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-xs mt-1 ml-1">{errors.email}</p>
                )}
              </div>
              {/* Phone */}
              <div className="form-control">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="size-5 text-base-content/40" />
                  </div>
                  <input
                    name="phone"
                    placeholder="Phone (Optional)"
                    className={`input input-bordered w-full pl-10 ${
                      errors.phone ? "input-error" : ""
                    }`}
                    value={formData.phone}
                    onChange={handleInputChange(setFormData, setErrors)}
                  />
                </div>
                {errors.phone && (
                  <p className="text-error text-xs mt-1 ml-1">{errors.phone}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="form-control">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      className={`input input-bordered w-full pl-10 ${
                        errors.password ? "input-error" : ""
                      }`}
                      value={formData.password}
                      onChange={handleInputChange(setFormData, setErrors)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5 text-base-content/40" />
                      ) : (
                        <Eye className="size-5 text-base-content/40" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-error text-xs mt-1 ml-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                {/* Confirm Password */}
                <div className="form-control">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      className={`input input-bordered w-full pl-10 ${
                        errors.confirmPassword ? "input-error" : ""
                      }`}
                      value={formData.confirmPassword}
                      onChange={handleInputChange(setFormData, setErrors)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5 text-base-content/40" />
                      ) : (
                        <Eye className="size-5 text-base-content/40" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-error text-xs mt-1 ml-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-base-content/60">
                Already have an account?{" "}
                <Link to="/login" className="link link-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <AuthImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved one"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
