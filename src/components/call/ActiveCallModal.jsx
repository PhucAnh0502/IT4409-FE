import React, { useState, useEffect } from 'react';
import { StreamVideo, StreamCall, ParticipantView, useCallStateHooks } from '@stream-io/video-react-sdk';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MonitorUp, User } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';
import { sanitizeUserId } from '../../lib/callHelpers';
import { useUserStore } from "../../stores/useUserStore";
import { getUserIdFromToken } from '../../lib/utils';

// Component pattern cho từng participant
const ParticipantPattern = ({ participant, isCurrentUser, isAudioOnly }) => {
  // Lấy các hàm và state từ store
  const { getUserById, user: fetchedUser, isLoadingUser } = useUserStore();

  const [displayName, setDisplayName] = useState('Loading...');

  const participantId = participant?.userId || participant?.user_id || 'Unknown';

  useEffect(() => {
    // Trường hợp id không hợp lệ
    if (!participantId || participantId === 'Unknown') {
      setDisplayName('Unknown');
      return;
    }

    // Nếu là current user → hiển thị ngay "You"
    if (isCurrentUser) {
      setDisplayName('You');
      return;
    }

    // Gọi hàm từ store để lấy user
    const loadUser = async () => {
      try {
        // getUserById trả về promise chứa user object
        const userData = await getUserById(participantId);

        // userData có thể là res trực tiếp hoặc res.data, tùy backend
        const fullName = userData?.fullName || userData?.data?.fullName || 'Unknown';
        const userName = userData?.userName || userData?.data?.userName || 'Unknown';

        // Ưu tiên fullName, fallback userName, rồi participantId
        setDisplayName(
          fullName !== 'Unknown'
            ? fullName
            : userName !== 'Unknown'
              ? userName
              : participantId
        );
      } catch (error) {
        
        setDisplayName('Error');
      }
    };

    loadUser();

  }, [participantId, isCurrentUser, getUserById]); // dependencies quan trọng



  // Detect if participant is speaking
  const isSpeaking = participant?.isSpeaking || false;
  const audioLevel = participant?.audioLevel || 0;

  // Dynamic border color based on speaking state
  const borderClass = isSpeaking
    ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)] animate-pulse'
    : 'border-gray-700';

  return (
    <div className="flex flex-col gap-3">
      {/* Participant Info */}
      <div className={`bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border transition-all duration-300 ${isSpeaking ? 'border-green-400' : 'border-white/20'}`}>
        <p className="text-white/90 text-sm font-medium flex items-center gap-2">
          <span className="truncate">
            {isLoadingUser ? 'Loading...' : displayName}
            {/* {isCurrentUser && " (You)"} */}
          </span>
          {isSpeaking && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            </span>
          )}
        </p>
      </div>

      {/* Participant Video/Audio */}
      {!isAudioOnly ? (
        <div className={`rounded-2xl overflow-hidden bg-black border-2 shadow-xl aspect-video transition-all duration-300 ${borderClass}`}>
          <ParticipantView
            participant={participant}
            ParticipantViewUI={null}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border-2 shadow-xl aspect-video flex items-center justify-center transition-all duration-300 ${borderClass}`}>
          <div className="flex flex-col items-center gap-4">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl transition-all duration-300 ${isSpeaking ? 'scale-110 shadow-[0_0_30px_rgba(74,222,128,0.5)]' : ''}`}>
              <User className="w-12 h-12 text-white" />
            </div>
            <p className="text-white/80 font-medium">
              {isLoadingUser ? 'Loading...' : displayName}
              {/* {isCurrentUser && " (You)"} */}
            </p>
            {isSpeaking && (
              <div className="flex gap-1">
                <span className="w-1 h-4 bg-green-400 rounded-full animate-pulse"></span>
                <span className="w-1 h-4 bg-green-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-4 bg-green-400 rounded-full animate-pulse delay-150"></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ActiveCallModal = () => {
  const { client, activeCall, endCall } = useCall();
  const [callDuration, setCallDuration] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);

  // Detect if call is audio-only
  const isAudioOnly = activeCall?.state?.custom?.isAudioOnly || false;
  const [isVideoOn, setIsVideoOn] = useState(!isAudioOnly);

  // Disable camera if audio-only call, enable if video call
  useEffect(() => {
    if (!activeCall) return;

    const isAudio = activeCall.state?.custom?.isAudioOnly || false;

    if (isAudio) {
      activeCall.camera.disable().catch(err => console.error('Error disabling camera:', err));
      setIsVideoOn(false);
    } else {
      // For video calls: explicitly enable camera and sync state
      activeCall.camera.enable()
        .then(() => {
          setIsVideoOn(true);
          
        })
        .catch(err => {
          
          // If camera fails to enable, set state to false
          setIsVideoOn(false);
        });
    }
  }, [activeCall]);

  // timer
  useEffect(() => {
    if (!activeCall) return;
    const start = Date.now();
    const t = setInterval(() => setCallDuration(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [activeCall]);

  // leave when remote ends
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
      if (activeCall) {
        endCall();
      }
    };
  }, []);

  if (!activeCall || !client) return null;

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleMic = async () => {
    try {
      if (isMicOn) await activeCall.microphone.disable();
      else await activeCall.microphone.enable();
      setIsMicOn(!isMicOn);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleVideo = async () => {
    if (isAudioOnly) return;
    try {
      if (isVideoOn) await activeCall.camera.disable();
      else await activeCall.camera.enable();
      setIsVideoOn(!isVideoOn);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleScreen = async () => {
    try {
      const isSharing = activeCall.state?.screenShare?.isLocalScreenShareEnabled;
      if (isSharing) await activeCall.screenShare.stopPublish();
      else await activeCall.screenShare.startPublish();
    } catch (e) {
      console.error(e);
    }
  };

  // Get and sort participants - current user first
  const participants = activeCall.state?.participants || [];
  const currentUserId = getUserIdFromToken();

  

  // Sort: current user first, then others (show all participants)
  const sortedParticipants = [...participants].sort((a, b) => {
    const aId = sanitizeUserId(a.userId || a.user_id || '');
    const bId = sanitizeUserId(b.userId || b.user_id || '');
    const currentSanitized = sanitizeUserId(currentUserId || '');

    if (aId === currentSanitized) return -1;
    if (bId === currentSanitized) return 1;
    return 0;
  });

  // Calculate grid columns based on participant count
  const getGridClass = (count) => {
    if (count === 1) return 'grid-cols-1 max-w-2xl mx-auto';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2'; // 2x2 grid for 3-4 participants
    if (count <= 6) return 'grid-cols-3'; // 2x3 grid for 5-6 participants
    if (count <= 9) return 'grid-cols-3'; // 3x3 grid for 7-9 participants
    return 'grid-cols-4'; // 4 columns for 10+ participants
  };

  // Reduce gap for many participants
  const getGapClass = (count) => {
    if (count <= 4) return 'gap-6';
    if (count <= 6) return 'gap-4';
    return 'gap-3';
  };

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
                  title="End Call"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Participants Grid */}
            <div className="flex-1 flex items-start justify-center p-6 pt-32 pb-64 overflow-y-auto">
              <div className="w-full max-w-7xl mx-auto h-auto flex items-start justify-center">
                <div className={`grid ${getGridClass(sortedParticipants.length)} ${getGapClass(sortedParticipants.length)} w-full`}>
                  {sortedParticipants.map((participant) => {
                    const participantId = sanitizeUserId(participant.userId || participant.user_id || '');
                    const currentSanitized = sanitizeUserId(currentUserId || '');
                    const isCurrentUser = participantId === currentUserId;
                    // fix: use unique key (userId or fallback)
                    return (
                      <ParticipantPattern
                        key={participantId || participant.userName || Math.random()}
                        participant={participant}
                        isCurrentUser={isCurrentUser}
                        isAudioOnly={isAudioOnly}
                      />
                    );
                  })}
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

                    {/* Camera Button */}
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
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xl"
                        title="End Call"
                      >
                        <PhoneOff className="w-7 h-7" />
                      </button>
                      <span className="text-white/70 text-xs font-medium">
                        End
                      </span>
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
