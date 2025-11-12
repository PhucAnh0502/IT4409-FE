import React, { useState } from "react";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../stores/useAuthStore";
import { handleInputChange } from "../lib/utils";
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
  });

  const { forgotPassword, isGettingResetEmail } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    // Email
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});

    const res = await forgotPassword(formData);
    if (res) navigate('/reset-password');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="size-6 text-primary" />
              <h1 className="text-2xl font-bold mt-2">Forgot your password</h1>
              <p className="text-base-content/60">Enter your email address to receive a password reset link.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isGettingResetEmail}
            >
              {isGettingResetEmail ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Send Reset Email"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Back to{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <AuthImagePattern
        title="Forgot Your Password?"
        subtitle="Don't worry! Enter your email address and we'll send you a link to get back into your account."
      />
    </div>
  );
};

export default ForgotPasswordPage;