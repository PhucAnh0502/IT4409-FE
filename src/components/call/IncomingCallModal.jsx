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
  const callerName = incomingCall.callerName || 'Someone';
  const isAudioOnly = incomingCall.isAudioOnly || false;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black animate-fadeIn">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>

      <div className="relative max-w-md w-full mx-4">
        <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-gray-700/50">
          {/* Caller Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {/* Animated ring effect */}
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20"></div>
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse"></div>

              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Caller Name */}
            <h2 className="text-4xl font-bold text-white mt-6 mb-2 text-center">
              {callerName}
            </h2>

            {/* Call Type Badge */}
            <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              {isAudioOnly ? (
                <>
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold text-sm">Incoming Audio Call</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold text-sm">Incoming Video Call</span>
                </>
              )}
            </div>

            {/* Ringing indicator */}
            <p className="text-white/60 text-sm mt-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Ringing...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={rejectCall}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center group"
              >
                <PhoneOff className="w-9 h-9 group-hover:rotate-12 transition-transform" />
              </button>
              <span className="text-white/80 text-sm font-medium">Decline</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={acceptCall}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center group animate-bounce"
              >
                {isAudioOnly ? (
                  <Phone className="w-9 h-9 group-hover:rotate-12 transition-transform" />
                ) : (
                  <Video className="w-9 h-9 group-hover:rotate-12 transition-transform" />
                )}
              </button>
              <span className="text-white/80 text-sm font-medium">Accept</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;