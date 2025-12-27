import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

const OutgoingCallModal = () => {
  const { outgoingCall, cancelOutgoing } = useCall();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const it = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(it);
  }, []);

  // Cleanup: cancel outgoing call if component unmounts unexpectedly
  useEffect(() => {
    return () => {
      // Nếu modal bị đóng mà vẫn còn outgoingCall, cancel nó
      if (outgoingCall) {
        cancelOutgoing();
      }
    };
  }, []);

  if (!outgoingCall) return null;

  const { receiverName, callType } = outgoingCall;
  const isAudioOnly = callType === 'audio_room' || outgoingCall.isAudioOnly;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black animate-fadeIn">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>

      <div className="relative max-w-md w-full mx-4">
        <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-gray-700/50">
          {/* Receiver Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {/* Animated ring effect - pulsing outward */}
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20"></div>
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-50 animate-pulse"></div>

              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                <User className="w-16 h-16 text-white" />
              </div>

              {/* Call type indicator */}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 flex items-center justify-center shadow-lg">
                {isAudioOnly ? (
                  <Phone className="w-5 h-5 text-green-400" />
                ) : (
                  <Video className="w-5 h-5 text-blue-400" />
                )}
              </div>
            </div>

            {/* Receiver Name */}
            <h2 className="text-4xl font-bold text-white mt-6 mb-2 text-center">
              {receiverName || 'Someone'}
            </h2>

            {/* Call Type Badge */}
            <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              {isAudioOnly ? (
                <>
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold text-sm">Audio Call</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold text-sm">Video Call</span>
                </>
              )}
            </div>

            {/* Calling indicator */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
              </div>
              <p className="text-white/70 text-sm font-medium">
                Calling{dots}
              </p>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={cancelOutgoing}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center group"
              >
                <PhoneOff className="w-9 h-9 group-hover:rotate-12 transition-transform" />
              </button>
              <span className="text-white/80 text-sm font-medium">End Call</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutgoingCallModal;
