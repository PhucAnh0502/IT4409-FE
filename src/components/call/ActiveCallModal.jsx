import React, { useState, useEffect } from 'react';
import { StreamVideo, StreamCall, SpeakerLayout, useCallStateHooks } from '@stream-io/video-react-sdk';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MonitorUp, User } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';

const ActiveCallModal = () => {
  const { client, activeCall, endCall } = useCall();
  const [callDuration, setCallDuration] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);

  // Detect if call is audio-only
  const isAudioOnly = activeCall?.state?.custom?.isAudioOnly || false;
  const [isVideoOn, setIsVideoOn] = useState(!isAudioOnly);

  // Disable camera if audio-only call
  useEffect(() => {
    if (!activeCall) return;

    const isAudio = activeCall.state?.custom?.isAudioOnly || false;

    if (isAudio) {
      // Tắt camera cho audio call
      activeCall.camera.disable().catch(err => console.error('Error disabling camera:', err));
      setIsVideoOn(false);
    }
  }, [activeCall]);

  // timer
  useEffect(() => {
    if (!activeCall) return;
    const start = Date.now();
    const t = setInterval(() => setCallDuration(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [activeCall]);

  // leave when remote ends (call.ended handled in context too)
  useEffect(() => {
    if (!activeCall) return;
    const onEnded = () => endCall();
    activeCall.on('call.ended', onEnded);
    return () => { try { activeCall.off('call.ended', onEnded); } catch (e) { } };
  }, [activeCall, endCall]);

  // cleanup on unload/refresh
  useEffect(() => {
    const onUnload = async () => {
      if (activeCall) {
        try {
          await activeCall.leave();
        } catch (e) {
          console.error('Error leaving call on unload:', e);
        }
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [activeCall]);

  // cleanup on component unmount
  useEffect(() => {
    return () => {
      // Nếu modal bị unmount mà vẫn còn activeCall, end nó
      if (activeCall) {
        endCall();
      }
    };
  }, []);

  if (!activeCall || !client) return null;

  const formatDuration = (s) => {
    const m = Math.floor(s / 60); const sec = s % 60; return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleMic = async () => {
    try { if (isMicOn) await activeCall.microphone.disable(); else await activeCall.microphone.enable(); setIsMicOn(!isMicOn); } catch (e) { console.error(e); }
  };

  const toggleVideo = async () => {
    // Không cho toggle camera nếu là audio call
    if (isAudioOnly) return;
    try { if (isVideoOn) await activeCall.camera.disable(); else await activeCall.camera.enable(); setIsVideoOn(!isVideoOn); } catch (e) { console.error(e); }
  };
  const toggleScreen = async () => {
    try { const isSharing = activeCall.state?.screenShare?.isLocalScreenShareEnabled; if (isSharing) await activeCall.screenShare.stopPublish(); else await activeCall.screenShare.startPublish(); } catch (e) { console.error(e); }
  };

  // Get participant names (exclude current user)
  const participants = activeCall.state?.participants || [];
  const currentUserId = client?.user?.id;

  const participantNames = participants
    .filter(p => {
      console.log('Checking participant:', p, 'userId:', p.userId, 'currentUserId:', currentUserId);
      return p.userId !== currentUserId;
    })
    .map(p => {
      const name = p.name || p.userName || p.userId;
      console.log('Participant name:', name, 'from:', p);
      return name;
    })
    .filter(name => name)
    .join(', ');

  console.log('Final participant names:', participantNames);

  return (
    <div className="fixed inset-0 z-[10000] bg-gray-900">
      <StreamVideo client={client}>
        <StreamCall call={activeCall}>
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {isAudioOnly ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <VideoIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-bold text-xl tracking-tight">
                        {isAudioOnly ? 'Audio Call' : 'Video Call'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-white/80 text-sm font-medium">{formatDuration(callDuration)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={endCall}
                  className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all duration-200 hover:scale-110"
                  title="Minimize"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Participants info - Show full names */}
              <div className="px-6 pb-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20">
                  <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                    {/*<User className="w-4 h-4" />*/}
                    <span className="truncate">
                      {participantNames
                        ? participantNames.split(', ').slice(0, -1).join(', ')
                        : 'Connecting...'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <div className="w-full h-full max-w-7xl mx-auto p-4 pt-32 pb-32">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-black shadow-2xl border border-gray-700">
                  <style>{`
                    /* Ẩn tất cả avatar placeholders */
                    .str-video__participant-view__avatar,
                    [class*="avatar"],
                    [class*="Avatar"],
                    .str-video__participant-details,
                    .str-video__participant-info {
                      display: none !important;
                    }
                    
                    /* Chỉ hiển thị video track */
                    .str-video__video,
                    video {
                      width: 100% !important;
                      height: 100% !important;
                      object-fit: cover !important;
                    }
                    
                    /* Ẩn participant name overlay */
                    .str-video__participant-view__label,
                    .str-video__participant-label {
                      display: none !important;
                    }
                  `}</style>
                  <SpeakerLayout />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 pb-10">
              <div className="max-w-2xl mx-auto">
                <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-700">
                  <div className="flex items-center justify-center gap-4">

                    {/* Mic Button */}
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={toggleMic}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg ${isMicOn
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        title={isMicOn ? 'Mute' : 'Unmute'}
                      >
                        {isMicOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
                      </button>
                      <span className="text-white/70 text-xs font-medium">
                        {isMicOn ? 'Mic' : 'Muted'}
                      </span>
                    </div>

                    {/* Camera Button (only for video calls) */}
                    {!isAudioOnly && (
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={toggleVideo}
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg ${isVideoOn
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          title={isVideoOn ? 'Stop Video' : 'Start Video'}
                        >
                          {isVideoOn ? <VideoIcon className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
                        </button>
                        <span className="text-white/70 text-xs font-medium">
                          {isVideoOn ? 'Camera' : 'Off'}
                        </span>
                      </div>
                    )}

                    {/* End Call Button */}
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={endCall}
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 hover:scale-110 shadow-lg"
                        title="End Call"
                      >
                        <PhoneOff className="w-7 h-7" />
                      </button>
                      <span className="text-red-400 text-xs font-medium">End</span>
                    </div>

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
