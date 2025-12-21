import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { StreamVideo, StreamCall } from '@stream-io/video-react-sdk';
import { useCall } from '../../contexts/CallContext';

const IncomingCallModal = () => {
  const { client, incomingCall, acceptCall, rejectCall } = useCall();
  const [ringtone] = useState(new Audio('/ringtone.mp3'));

  useEffect(() => {
    if (incomingCall) {
      ringtone.loop = true;
      ringtone.play().catch(e => console.log('Cannot play ringtone:', e));
    }

    return () => {
      ringtone.pause();
      ringtone.currentTime = 0;
    };
  }, [incomingCall, ringtone]);

  if (!incomingCall || !client) return null;

  // Lấy tên người gọi - ưu tiên name, fallback sang custom name, cuối cùng mới là 'Someone'
  const callerName = incomingCall.state?.createdBy?.name 
    || incomingCall.state?.createdBy?.custom?.name 
    || 'Someone';
  const isAudioOnly = incomingCall.state?.custom?.isAudioOnly || false;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 animate-fadeIn">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-md w-full mx-4">
        {/* Main Card */}
        <div className="bg-base-100/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-base-300">
          {/* Avatar with pulsing ring */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 -m-4">
                <div className="w-full h-full rounded-full bg-primary/30 animate-ping"></div>
              </div>
              <div className="absolute inset-0 -m-2">
                <div className="w-full h-full rounded-full bg-primary/20 animate-pulse"></div>
              </div>
              
              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
                <User className="w-16 h-16 text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Caller Name */}
            <h2 className="text-3xl font-bold text-base-content mt-6 mb-1">{callerName}</h2>
            
            {/* Call Type Badge */}
            <div className="flex items-center gap-2 mt-3">
              {isAudioOnly ? (
                <>
                  <Phone className="w-4 h-4 text-success" />
                  <span className="text-base-content/70 font-medium">Incoming Audio Call</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 text-primary" />
                  <span className="text-base-content/70 font-medium">Incoming Video Call</span>
                </>
              )}
            </div>

            {/* Ringing text */}
            <p className="text-base-content/50 text-sm mt-2 animate-pulse">Ringing...</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={rejectCall}
                className="w-16 h-16 rounded-full bg-error hover:bg-error/80 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <PhoneOff className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
              <span className="text-xs font-medium text-base-content/60">Decline</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-success hover:bg-success/80 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 animate-pulse-gentle"
              >
                {isAudioOnly ? (
                  <Phone className="w-7 h-7 text-white" strokeWidth={2} />
                ) : (
                  <Video className="w-7 h-7 text-white" strokeWidth={2} />
                )}
              </button>
              <span className="text-xs font-medium text-base-content/60">Accept</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
