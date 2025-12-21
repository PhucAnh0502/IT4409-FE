import React, { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Phone } from "lucide-react";
import { sanitizeUserId } from "../../lib/callHelpers";
import { extractUserInfo } from "../../lib/jwtUtils";
import { getStreamToken } from "../../lib/tokenService";

const API_KEY = import.meta.env.VITE_GETSTREAM_API_KEY;

const CallUI = ({ onClose, callType }) => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (callingState === "left") {
      onClose();
    }
  }, [callingState, onClose]);

  // Timer cho call duration
  useEffect(() => {
    if (callingState === "joined") {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [callingState]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isAudioCall = callType === 'audio_room';

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-semibold">
              {isAudioCall ? 'Audio Call' : 'Video Call'}
            </h2>
            {callingState === "joined" && (
              <p className="text-gray-300 text-sm mt-1">
                {formatDuration(callDuration)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-red-500/90 backdrop-blur-sm hover:bg-red-600 rounded-full text-white transition-all shadow-lg hover:scale-110"
            aria-label="Close call"
          >
            <X className="size-6" />
          </button>
        </div>
      </div>

      {/* Video/Audio Content */}
      <div className="flex-1 flex items-center justify-center p-8 pt-24">
        {isAudioCall ? (
          // Audio Call UI - Show avatars
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {participants.map((participant) => (
              <div key={participant.sessionId} className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                    {participant.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  {!participant.isLocalParticipant && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-gray-900 flex items-center justify-center">
                      <Phone className="size-5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-white mt-4 text-lg font-medium">
                  {participant.name || 'Anonymous'}
                </p>
                <div className="flex gap-2 mt-2">
                  {participant.publishedTracks.includes('audio') ? (
                    <Mic className="size-4 text-green-400" />
                  ) : (
                    <MicOff className="size-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Video Call UI
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <SpeakerLayout />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex justify-center">
          <CallControls onLeave={onClose} />
        </div>
      </div>

      {/* Call State Indicator */}
      {callingState !== "joined" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block animate-pulse">
                <Phone className="size-16 text-blue-400" />
              </div>
            </div>
            <p className="text-white text-xl font-medium">
              {callingState === "ringing" ? "Đang gọi..." : 
               callingState === "joining" ? "Đang kết nối..." : 
               "Đang xử lý..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const CallModal = ({ isOpen, onClose, callType, callId, authUser, participants }) => {
  const [client, setClient] = React.useState(null);
  const [call, setCall] = React.useState(null);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    if (!isOpen) {
      console.log("CallModal: Not open");
      return;
    }
    
    if (!authUser) {
      console.log("CallModal: No authUser");
      setError("Không tìm thấy thông tin đăng nhập");
      return;
    }

    console.log("=== CallModal: Initializing ===");
    console.log("Props:", { callType, callId, authUser, participants });

    const initCall = async () => {
      try {
        // Lấy userId và userName từ authUser
        const { userId, userName } = extractUserInfo(authUser);
        
        console.log("Extracted info:", { userId, userName });
        
        if (!userId) {
          throw new Error("Không thể xác định user ID. Vui lòng đăng nhập lại.");
        }
        
        // Sanitize userId để đảm bảo tương thích với GetStream
        const sanitizedUserId = sanitizeUserId(userId);
        console.log("Sanitized user ID:", sanitizedUserId);
        
        if (!sanitizedUserId) {
          throw new Error("Invalid user ID format");
        }
        
        // Lấy token từ token server
        console.log("Getting token from token server...");
        const token = await getStreamToken(sanitizedUserId);
        console.log("Token received from server");
        
        const videoClient = new StreamVideoClient({
          apiKey: API_KEY,
          user: {
            id: sanitizedUserId,
            name: userName || sanitizedUserId,
          },
          token: token, // Sử dụng token thật từ server
        });
        console.log("Client created successfully");
        setClient(videoClient);

        // Tạo hoặc join call
        const newCall = videoClient.call(callType, callId);
        console.log("Call object created:", callType, callId);
        
        // Tạo call với danh sách participants
        const members = [
          { user_id: sanitizedUserId }, // Thêm người gọi
          ...participants.map(p => ({ 
            user_id: sanitizeUserId(p.userId),
            custom: {
              name: p.name || p.userId
            }
          }))
        ];
        
        console.log("Call members:", members);
        
        await newCall.getOrCreate({
          ring: true,
          data: {
            members: members,
          },
        });

        console.log("Call created successfully");
        
        // Join call
        await newCall.join();
        console.log("Joined call successfully");
        
        // Nếu là audio call, tắt camera sau khi join
        if (callType === 'audio_room') {
          await newCall.camera.disable();
          console.log("Camera disabled for audio call");
        }
        
        setCall(newCall);
      } catch (error) {
        console.error("Error initializing call:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        setError(error.message);
        setTimeout(onClose, 3000);
      }
    };

    initCall();

    return () => {
      if (call) {
        console.log("Cleaning up call");
        call.leave().catch(console.error);
      }
      if (client) {
        console.log("Disconnecting client");
        client.disconnectUser().catch(console.error);
      }
    };
  }, [isOpen, callType, callId, authUser, participants, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fadeIn">
      <div className="w-full h-full">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-white px-4">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <PhoneOff className="size-10 text-red-500" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-bold mb-2">Không thể kết nối</h3>
              <p className="text-red-400 text-lg mb-6">{error}</p>
              <button 
                onClick={onClose} 
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full text-white font-medium shadow-lg transition-all hover:scale-105"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallUI onClose={onClose} callType={callType} />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-white">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Phone className="size-10 text-blue-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-medium mb-2">Đang kết nối cuộc gọi</p>
              <p className="text-gray-400">Vui lòng chờ trong giây lát...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
