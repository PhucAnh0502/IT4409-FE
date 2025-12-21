import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { getStreamToken } from '../lib/tokenService';
import { extractUserInfo } from '../lib/jwtUtils';
import { sanitizeUserId } from '../lib/callHelpers';
import { useAuthStore } from '../stores/useAuthStore';
import toast from 'react-hot-toast';

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const { authUser } = useAuthStore();
  const [client, setClient] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  // Initialize StreamVideoClient
  useEffect(() => {
    if (!authUser) {
      console.log('No authUser, skipping client init');
      setClient(null);
      return;
    }

    const initClient = async () => {
      try {
        console.log('Initializing StreamVideoClient...');
        const { userId, userName } = extractUserInfo(authUser);
        console.log('User info:', { userId, userName });
        
        if (!userId) {
          console.error('No userId extracted');
          return;
        }

        const sanitizedUserId = sanitizeUserId(userId);
        console.log('Sanitized userId:', sanitizedUserId);
        
        const token = await getStreamToken(sanitizedUserId);
        console.log('Token received:', token ? 'Yes' : 'No');

        const videoClient = new StreamVideoClient({
          apiKey: import.meta.env.VITE_GETSTREAM_API_KEY,
          user: {
            id: sanitizedUserId,
            name: userName || sanitizedUserId,
          },
          token: token,
        });

        setClient(videoClient);
        console.log('StreamVideoClient initialized for:', sanitizedUserId);

        // Listen for incoming calls
        videoClient.on('call.ring', (event) => {
          console.log('Incoming call event received:', event);
          const callCid = event.call?.cid; // Format: "default:call-id" or "audio_room:call-id"
          if (callCid) {
            const [callType, callId] = callCid.split(':');
            console.log('Call details:', {
              callId,
              callType,
              cid: callCid,
              createdBy: event.call?.state?.createdBy
            });
            
            // Get proper call instance from client
            const call = videoClient.call(callType, callId);
            setIncomingCall(call);
          }
        });

        return () => {
          console.log('🔌 Disconnecting video client');
          videoClient.disconnectUser();
        };
      } catch (error) {
        console.error('Error initializing video client:', error);
      }
    };

    initClient();
  }, [authUser]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) {
      console.log('No incoming call to accept');
      return;
    }

    try {
      console.log('Accepting call:', incomingCall.id, 'type:', incomingCall.type);
      
      // Join the call
      await incomingCall.join();
      console.log('Successfully joined call');
      
      // Kiểm tra xem có phải audio-only call không
      const isAudioOnly = incomingCall.state?.custom?.isAudioOnly;
      if (isAudioOnly) {
        console.log('Audio-only call detected, disabling camera');
        await incomingCall.camera.disable();
      }
      
      setActiveCall(incomingCall);
      setIncomingCall(null);
      toast.success('Đã tham gia cuộc gọi');
    } catch (error) {
      console.error('Error accepting call:', error);
      console.error('Error details:', error);
      toast.error('Không thể tham gia cuộc gọi');
    }
  }, [incomingCall]);

  // Reject incoming call
  const rejectCall = useCallback(async () => {
    if (!incomingCall) {
      console.log('No incoming call to reject');
      return;
    }

    try {
      console.log('Rejecting call:', incomingCall.id);
      
      // Reject the call
      await incomingCall.leave({ reject: true });
      console.log('Call rejected successfully');
      
      setIncomingCall(null);
      toast('Đã từ chối cuộc gọi');
    } catch (error) {
      console.error('Error rejecting call:', error);
      console.error('Error details:', error);
      toast.error('Không thể từ chối cuộc gọi');
    }
  }, [incomingCall]);

  // End active call
  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      console.log('Ending call:', activeCall.id);
      await activeCall.leave();
      setActiveCall(null);
      toast('Cuộc gọi đã kết thúc');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, [activeCall]);

  // Monitor active call participants - auto end 1-1 calls when other person leaves
  useEffect(() => {
    if (!activeCall) return;

    console.log('👥 Setting up participant monitoring for call:', activeCall.id);

    // Lắng nghe khi có participant rời khỏi cuộc gọi
    const handleParticipantLeft = (event) => {
      console.log('Participant left:', event);
      
      // Đợi một chút rồi kiểm tra số lượng participants
      setTimeout(() => {
        const participants = activeCall.state.participants || [];
        const activeParticipants = participants.filter(p => !p.left_at);
        
        console.log('Current active participants:', activeParticipants.length);
        console.log('Participants:', activeParticipants.map(p => ({
          id: p.user_id,
          name: p.name,
          left: !!p.left_at
        })));

        // Lấy tổng số members ban đầu của cuộc gọi
        const totalMembers = activeCall.state?.members?.length || 2;
        console.log('👥 Total members in call:', totalMembers);

        // Logic: 
        // - Cuộc gọi 1-1 (2 người): Kết thúc khi chỉ còn 1 người (người kia đã rời)
        // - Cuộc gọi nhóm (>2 người): Chỉ kết thúc khi không còn ai (0 người)
        const shouldEnd = totalMembers === 2 
          ? activeParticipants.length <= 1  // 1-1: end when only 1 left
          : activeParticipants.length === 0; // Group: end when no one left

        if (shouldEnd) {
          console.log('Call should end now');
          if (totalMembers === 2) {
            toast('Đối phương đã rời khỏi cuộc gọi');
          } else {
            toast('Cuộc gọi đã kết thúc');
          }
          endCall();
        } else {
          console.log('Call continues with', activeParticipants.length, 'participants');
        }
      }, 500); // Delay ngắn để state cập nhật
    };

    // Lắng nghe khi cuộc gọi kết thúc từ server
    const handleCallEnded = (event) => {
      console.log('Call ended from server:', event);
      setActiveCall(null);
      toast('Cuộc gọi đã kết thúc');
    };

    activeCall.on('call.session_participant_left', handleParticipantLeft);
    activeCall.on('call.ended', handleCallEnded);

    return () => {
      activeCall.off('call.session_participant_left', handleParticipantLeft);
      activeCall.off('call.ended', handleCallEnded);
    };
  }, [activeCall, endCall]);

  const value = {
    client,
    incomingCall,
    activeCall,
    setActiveCall,
    acceptCall,
    rejectCall,
    endCall,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
