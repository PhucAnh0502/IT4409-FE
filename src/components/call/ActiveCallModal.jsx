import React, { useState, useEffect } from 'react';
import { StreamVideo, StreamCall, SpeakerLayout } from '@stream-io/video-react-sdk';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MonitorUp, User } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

const ActiveCallModal = () => {
  const { client, activeCall, endCall } = useCall();
  const [callDuration, setCallDuration] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Call duration timer
  useEffect(() => {
    if (!activeCall) return;
    
    const startTime = Date.now();
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCall]);

  if (!activeCall || !client) return null;

  const isAudioOnly = activeCall.state?.custom?.isAudioOnly || false;
  
  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle microphone
  const toggleMic = async () => {
    try {
      if (isMicOn) {
        await activeCall.microphone.disable();
      } else {
        await activeCall.microphone.enable();
      }
      setIsMicOn(!isMicOn);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        await activeCall.camera.disable();
      } else {
        await activeCall.camera.enable();
      }
      setIsVideoOn(!isVideoOn);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      const isSharing = activeCall.state.screenShare?.isLocalScreenShareEnabled;
      if (isSharing) {
        await activeCall.screenShare.stopPublish();
      } else {
        await activeCall.screenShare.startPublish();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-base-300">
      <StreamVideo client={client}>
        <StreamCall call={activeCall}>
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 via-black/40 to-transparent p-6">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {isAudioOnly ? (
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-success" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <VideoIcon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {isAudioOnly ? 'Audio Call' : 'Video Call'}
                      </h3>
                      <p className="text-white/70 text-sm">{formatDuration(callDuration)}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={endCall}
                  className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Content */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200">
              <div className="w-full h-full max-w-7xl mx-auto p-4 pt-24 pb-32">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-base-100 shadow-2xl border border-base-300\">
                  <SpeakerLayout />
                </div>
              </div>
            </div>

            {/* Custom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pb-8">
              <div className="max-w-2xl mx-auto">
                <div className="bg-base-100/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-base-300">
                  <div className="flex items-center justify-center gap-4">
                    {/* Microphone Toggle */}
                    <button
                      onClick={toggleMic}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                        isMicOn 
                          ? 'bg-base-200 hover:bg-base-300 text-base-content' 
                          : 'bg-error hover:bg-error/80 text-white'
                      }`}
                      title={isMicOn ? 'Tắt micro' : 'Bật micro'}
                    >
                      {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </button>

                    {/* Video Toggle (only show if not audio-only call) */}
                    {!isAudioOnly && (
                      <button
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                          isVideoOn 
                            ? 'bg-base-200 hover:bg-base-300 text-base-content' 
                            : 'bg-error hover:bg-error/80 text-white'
                        }`}
                        title={isVideoOn ? 'Tắt camera' : 'Bật camera'}
                      >
                        {isVideoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                      </button>
                    )}

                    {/* Screen Share (only show if not audio-only call) */}
                    {!isAudioOnly && (
                      <button
                        onClick={toggleScreenShare}
                        className="w-14 h-14 rounded-full bg-base-200 hover:bg-base-300 text-base-content flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                        title="Chia sẻ màn hình"
                      >
                        <MonitorUp className="w-6 h-6" />
                      </button>
                    )}

                    {/* End Call */}
                    <button
                      onClick={endCall}
                      className="w-14 h-14 rounded-full bg-error hover:bg-error/80 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Kết thúc cuộc gọi"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

export default ActiveCallModal;
