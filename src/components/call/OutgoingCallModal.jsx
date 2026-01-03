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

  const { receiverName, callType, participants = [] } = outgoingCall;
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
          {/* Avatars for all participants */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {participants.length > 0 ? participants.map((p, idx) => (
                <div key={p.userId || idx} className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <User className="w-6 h-6 text-white" />
                </div>
              )) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            {/* Names of all participants */}
            <h2 className="text-2xl font-bold text-white mt-2 mb-2 text-center">
              {participants.length > 0
                ? participants.map((p) => p.name).join(', ')
                : (receiverName || 'Someone')}
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
