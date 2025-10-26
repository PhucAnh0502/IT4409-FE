import React from "react";
import { useNavigate } from "react-router-dom";

export default function Recovered() {
  const navigate = useNavigate();

  // Function to handle back to login
  const handleBackToLogin = () => {
    navigate("/login"); // navigate to loginPage
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f2f5' }}>
      <div className="bg-white px-8 py-12 rounded-lg text-center max-w-md w-full mx-4" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)' }}>
        <div className="flex flex-col items-center space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#42b72a' }}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold" style={{ color: '#1c1e21' }}>
            Password Reset Successfully
          </h1>

          {/* Description */}
          <p className="text-base" style={{ color: '#65676b' }}>
            Your password has been changed successfully. You can now login with your new password.
          </p>

          {/* Back to Login button */}
          <button
            onClick={handleBackToLogin}
            className="w-full py-3 rounded-lg text-white text-base font-semibold transition-all hover:opacity-90 mt-4"
            style={{ backgroundColor: '#1877f2' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
