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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 animate-fadeIn">
      <div className="relative max-w-md w-full mx-4">
        <div className="bg-base-100/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-base-300">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
              <User className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-base-content mt-6 mb-1">{receiverName || 'Someone'}</h2>
            <div className="flex items-center gap-2 mt-3">
              {isAudioOnly ? (<><Phone className="w-4 h-4 text-success" /><span className="text-base-content/70 font-medium">Audio Call</span></>) : (<><Video className="w-4 h-4 text-primary" /><span className="text-base-content/70 font-medium">Video Call</span></>)}
            </div>
            <p className="text-base-content/50 text-sm mt-2">Calling{dots}</p>
          </div>
          <div className="flex items-center justify-center mt-8">
            <div className="flex flex-col items-center gap-3">
              <button onClick={cancelOutgoing} className="w-16 h-16 rounded-full bg-error text-white"><PhoneOff className="w-7 h-7" /></button>
              <span className="text-xs">End Call</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutgoingCallModal;
