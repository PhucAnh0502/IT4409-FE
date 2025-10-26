import React from 'react';
import EmailResetPassword from "../components/EmailResetPassword";
import OTPInput from "../components/OTPInput";
import ResetPassword from '../components/ResetPassword';
import Recovered from '../components/Recovered';
import { useRecoveryStore } from "../stores/useRecoveryStore";

const ForgotPasswordPage = () => {
  const { page } = useRecoveryStore();

  function NavigateComponents() {
    if (page === "login") return <EmailResetPassword />;
    if (page === "otp") return <OTPInput />;
    if (page === "reset") return <ResetPassword />;

    return <Recovered />;
  }

  return (
    <div className="flex justify-center items-center">
      <NavigateComponents />
    </div>
  );
}

export default ForgotPasswordPage
