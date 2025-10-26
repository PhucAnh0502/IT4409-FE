import React from "react";
import { useState } from "react";
import { useRecoveryStore } from "../stores/useRecoveryStore";

export default function OTPInput() {
  const { email, otp, setPage } = useRecoveryStore();
  const [timerCount, setTimer] = React.useState(60);
  const [OTPinput, setOTPinput] = useState([0, 0, 0, 0]);
  const [disable, setDisable] = useState(true);

  // Function to handle auto-focus to next input
  const handleInputChange = (index, value, nextInputId) => {
    // Update OTP array
    const newOTP = [...OTPinput];
    newOTP[index] = value;
    setOTPinput(newOTP);

    // Auto-focus to next input if value is entered
    if (value && nextInputId) {
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Resend OTP function temporary
  function resendOTP() {
    if (disable) return;
    //logic to resend OTP
    setTimer(60);
    setDisable(true);
    alert("A new OTP has been sent to your email");
    return;
  }

  function verfiyOTP() {
    console.log(OTPinput);
    console.log(otp);
    if (parseInt(OTPinput.join("")) == otp) {
      setPage("reset");
      return;
    }
    alert(
      "The code you have entered is not correct, try again or re-send the link"
    );
    return;
  }

  React.useEffect(() => {
    let interval = setInterval(() => {
      setTimer((lastTimerCount) => {
        lastTimerCount <= 1 && clearInterval(interval);
        if (lastTimerCount <= 1) setDisable(false);
        if (lastTimerCount <= 0) return lastTimerCount;
        return lastTimerCount - 1;
      });
    }, 1000); //each count lasts for a second
    //cleanup the interval on complete
    return () => clearInterval(interval);
  }, [disable]);

  return (
    <div className="flex justify-center items-center w-screen h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <div className="bg-white px-8 pt-10 pb-9 mx-auto w-full max-w-lg rounded-lg" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)' }}>
        <div className="mx-auto flex w-full max-w-md flex-col space-y-8">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#1877f2' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-bold text-2xl" style={{ color: '#1c1e21' }}>
              <p>Email Verification</p>
            </div>
            <div className="flex flex-col text-sm font-normal" style={{ color: '#65676b' }}>
              <p>We have sent a verification code to</p>
              <p className="font-semibold mt-1" style={{ color: '#1c1e21' }}>{email}</p>
            </div>
          </div>

          <div>
            <form>
              <div className="flex flex-col space-y-6">
                <div className="flex flex-row items-center justify-center gap-3 mx-auto w-full max-w-xs">
                  <div className="w-14 h-14">
                    <input
                      maxLength="1"
                      className="w-full h-full text-center outline-none rounded-lg border-2 text-xl font-semibold transition-all"
                      style={{ 
                        borderColor: '#dddfe2',
                        color: '#1c1e21',
                        backgroundColor: '#ffffff'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                      onBlur={(e) => e.target.style.borderColor = '#dddfe2'}
                      type="text"
                      id="otp-input-0"
                      onChange={(e) => handleInputChange(0, e.target.value, 'otp-input-1')}
                    ></input>
                  </div>
                  <div className="w-14 h-14">
                    <input
                      maxLength="1"
                      className="w-full h-full text-center outline-none rounded-lg border-2 text-xl font-semibold transition-all"
                      style={{ 
                        borderColor: '#dddfe2',
                        color: '#1c1e21',
                        backgroundColor: '#ffffff'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                      onBlur={(e) => e.target.style.borderColor = '#dddfe2'}
                      type="text"
                      id="otp-input-1"
                      onChange={(e) => handleInputChange(1, e.target.value, 'otp-input-2')}
                    ></input>
                  </div>
                  <div className="w-14 h-14">
                    <input
                      maxLength="1"
                      className="w-full h-full text-center outline-none rounded-lg border-2 text-xl font-semibold transition-all"
                      style={{ 
                        borderColor: '#dddfe2',
                        color: '#1c1e21',
                        backgroundColor: '#ffffff'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                      onBlur={(e) => e.target.style.borderColor = '#dddfe2'}
                      type="text"
                      id="otp-input-2"
                      onChange={(e) => handleInputChange(2, e.target.value, 'otp-input-3')}
                    ></input>
                  </div>
                  <div className="w-14 h-14">
                    <input
                      maxLength="1"
                      className="w-full h-full text-center outline-none rounded-lg border-2 text-xl font-semibold transition-all"
                      style={{ 
                        borderColor: '#dddfe2',
                        color: '#1c1e21',
                        backgroundColor: '#ffffff'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                      onBlur={(e) => e.target.style.borderColor = '#dddfe2'}
                      type="text"
                      id="otp-input-3"
                      onChange={(e) => handleInputChange(3, e.target.value, null)}
                    ></input>
                  </div>
                </div>

                <div className="flex flex-col space-y-4 mt-6">
                  <div>
                    <button
                      type="button"
                      onClick={() => verfiyOTP()}
                      className="flex flex-row cursor-pointer items-center justify-center text-center w-full rounded-lg outline-none py-3 border-none text-white text-base font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: '#1877f2' }}
                    >
                      Verify
                    </button>
                  </div>

                  <div className="flex flex-row items-center justify-center text-center text-sm font-normal space-x-1" style={{ color: '#65676b' }}>
                    <p>Didn't receive code?</p>
                    <button
                      type="button"
                      className="flex flex-row items-center font-semibold transition-all"
                      style={{
                        color: disable ? '#8a8d91' : '#1877f2',
                        cursor: disable ? 'not-allowed' : 'pointer',
                        textDecoration: disable ? 'none' : 'none',
                      }}
                      onMouseEnter={(e) => !disable && (e.target.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      onClick={() => resendOTP()}
                      disabled={disable}
                    >
                      {disable ? `Resend in ${timerCount}s` : "Resend code"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
