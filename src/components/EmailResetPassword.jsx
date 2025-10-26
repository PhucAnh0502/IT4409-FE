import React, { useState } from "react";
import { useRecoveryStore } from "../stores/useRecoveryStore";
import { handleInputChange } from "../lib/utils";
import { useNavigate } from "react-router-dom";

const EmailResetPassword = () => {
  const { setPage, setEmail, setOTP } = useRecoveryStore();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ email: "" });
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    // For demo: generate OTP 4 digits
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setEmail(formData.email);
    setOTP(otp);
    setPage("otp");
    console.log(`OTP sent to ${formData.email}: ${otp}`); // In real app, send OTP via email
  };

  // Navigation hook to go back to login page when cancel
  const handleBackToLogin = () => {
    navigate("/login"); // navigate to loginPage
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f0f2f5' }}>
      <div className="bg-white rounded-lg p-8 w-full max-w-md" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)' }}>
        <h1 className="text-xl font-bold mb-2 text-center" style={{ color: '#1c1e21' }}>
          Find Your Account
        </h1>
        <p className="text-sm mb-6 text-center" style={{ color: '#65676b' }}>
          Please enter your email to search for your account.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange(setFormData, setErrors)}
              className="w-full px-4 py-3 rounded-lg border text-base outline-none transition-all"
              style={{ 
                borderColor: errors.email ? '#f02849' : (formData.email ? '#1877f2' : '#dddfe2'),
                color: '#000000',
                backgroundColor: 'transparent'
              }}
              onFocus={(e) => {
                if (!errors.email) e.target.style.borderColor = '#1877f2';
              }}
              onBlur={(e) => {
                if (!errors.email) e.target.style.borderColor = formData.email ? '#1877f2' : '#dddfe2';
              }}
              placeholder="Email or mobile number"
            />
            {errors.email && (
              <span className="text-xs mt-1 block" style={{ color: '#f02849' }}>
                {errors.email}
              </span>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              className="px-6 py-2 rounded-lg text-base font-semibold transition-all"
              style={{ 
                backgroundColor: '#e4e6eb',
                color: '#1c1e21'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#d8dadf'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#e4e6eb'}
              onClick={handleBackToLogin}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-lg text-white text-base font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: '#1877f2' }}
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailResetPassword;
