import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

const InlineCallNotification = ({ callerName, isAudioOnly }) => {
    const { acceptCall, rejectCall } = useCall();

    return (
        <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 p-3 flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
                <Phone className="text-white w-5 h-5" />
                <span className="text-white font-medium">
                    {callerName} is calling...
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={rejectCall}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md"
                >
                    <PhoneOff className="w-4 h-4" />
                    Decline
                </button>
                <button
                    onClick={acceptCall}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md"
                >
                    <Phone className="w-4 h-4" />
                    Accept
                </button>
            </div>
        </div>
    );
};

export default InlineCallNotification;
