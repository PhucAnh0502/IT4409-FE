import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

const IncomingCallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useCall();
  const [ringtone] = useState(typeof Audio !== 'undefined' ? new Audio('/ringtone.mp3') : null);

  useEffect(() => {
    if (incomingCall && ringtone) {
      ringtone.loop = true;
      ringtone.play().catch(() => { });
    }
    return () => {
      if (ringtone) {
        ringtone.pause();
        ringtone.currentTime = 0;
      }
    };
  }, [incomingCall, ringtone]);

  // Cleanup: reject incoming call if component unmounts unexpectedly
  useEffect(() => {
    return () => {
      // Nếu modal bị đóng mà vẫn còn incomingCall, reject nó
      if (incomingCall) {
        rejectCall();
      }
    };
  }, []);

  if (!incomingCall) return null;

  // callerName và isAudioOnly được lưu từ CallContext khi nhận ring event
  const callerName = incomingCall.callerName;
  const isAudioOnly = incomingCall.isAudioOnly || false;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 animate-fadeIn">
      <div className="relative max-w-md w-full mx-4">
        <div className="bg-base-100/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-base-300">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
              <User className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-base-content mt-6 mb-1">{callerName}</h2>
            <div className="flex items-center gap-2 mt-3">
              {isAudioOnly ? (
                <><Phone className="w-4 h-4 text-success" /><span className="text-base-content/70 font-medium">Incoming Audio Call</span></>
              ) : (
                <><Video className="w-4 h-4 text-primary" /><span className="text-base-content/70 font-medium">Incoming Video Call</span></>
              )}
            </div>
            <p className="text-base-content/50 text-sm mt-2 animate-pulse">Ringing...</p>
          </div>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex flex-col items-center gap-3">
              <button onClick={rejectCall} className="w-16 h-16 rounded-full bg-error text-white"><PhoneOff className="w-7 h-7" /></button>
              <span className="text-xs">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button onClick={acceptCall} className="w-16 h-16 rounded-full bg-success text-white">{isAudioOnly ? <Phone className="w-7 h-7" /> : <Video className="w-7 h-7" />}</button>
              <span className="text-xs">Accept</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;