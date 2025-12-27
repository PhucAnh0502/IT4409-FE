import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { getStreamToken } from '../lib/tokenService';
import { sanitizeUserId } from '../lib/callHelpers';
import { getUserIdFromToken, getToken } from '../lib/utils';
import { getUserName } from '../lib/userService';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/useAuthStore';

const CallContext = createContext(null);

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
};

export const CallProvider = ({ children }) => {
  const { authUser } = useAuthStore();
  const [client, setClient] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  const currentUserId = getUserIdFromToken();
  const currentUserName = authUser?.userName;

  // Initialize StreamVideoClient
  useEffect(() => {
    const authToken = getToken();
    console.log('CallContext: Initializing client...', {
      hasToken: !!authToken,
      hasAuthUser: !!authUser,
      currentUserId,
      currentUserName
    });

    if (!authToken || !currentUserId) {
      console.warn('CallContext: Missing auth token or currentUserId', {
        hasToken: !!authToken,
        currentUserId
      });
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const sanitized = sanitizeUserId(currentUserId);
        console.log('Getting Stream token for:', sanitized);

        const streamToken = await getStreamToken(currentUserId);

        console.log('Stream token received');
        console.log('Stream token type:', typeof streamToken);
        console.log('Stream token length:', streamToken?.length);

        if (!streamToken) {
          console.error('Stream token is null or undefined');
          return;
        }

        const apiKey = import.meta.env.VITE_GETSTREAM_API_KEY;
        console.log('GetStream API Key from .env:', apiKey ? 'Present' : 'MISSING');

        if (!apiKey) {
          console.error('VITE_GETSTREAM_API_KEY is not defined in .env');
          console.error('Please add VITE_GETSTREAM_API_KEY to your .env file');
          return;
        }

        console.log('Fetching userName from API for userId:', currentUserId);
        let userName = authUser?.userName;
        if (!userName) {
          console.log('👤 Fetching userName from API for userId:', currentUserId);
          userName = await getUserName(currentUserId);
          console.log('✅ Fetched userName:', userName);
        }

        console.log('Creating StreamVideoClient with:', {
          apiKey: apiKey.substring(0, 10) + '...',
          userId: sanitized,
          userName: userName || sanitized,
          tokenLength: streamToken.length
        });

        const videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: sanitized,
            name: userName || sanitized
          },
          token: streamToken,
        });

        console.log('StreamVideoClient created successfully');

        if (!mounted) {
          console.log('Component unmounted, not setting client');
          return;
        }

        setClient(videoClient);
        console.log('Client set in state');

        // Listen for incoming ringing calls
        videoClient.on('call.ring', (ev) => {
          const callCid = ev.call?.cid;
          if (!callCid) return;
          const [callType, callId] = callCid.split(':');
          const call = videoClient.call(callType, callId);

          const callerName = ev.call?.custom?.callerName || ev.call?.created_by?.name || 'Someone';
          const isAudioOnly = ev.call?.custom?.isAudioOnly || false;

          setIncomingCall({ ...call, callerName, isAudioOnly });
        });
      } catch (e) {
        console.error('StreamVideo init error:', e);
        console.error('Error stack:', e.stack);
        console.error('Error message:', e.message);
      }
    })();

    return () => {
      mounted = false;
      if (client) client.disconnectUser();
    };
  }, [currentUserId]);

  // ==================== GLOBAL CLEANUP ON LOGOUT/AUTH CHANGE ====================
  useEffect(() => {
    const token = getToken();
    if (!token || !currentUserId) {
      setIncomingCall(null);
      setOutgoingCall(null);
      setActiveCall(null);
    }
  }, [currentUserId]);

  // ==================== GLOBAL CLEANUP ON PAGE UNLOAD ====================
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (activeCall) {
        try { await activeCall.leave(); } catch (e) { }
      }
      if (outgoingCall && client) {
        try {
          const call = client.call(outgoingCall.callType, outgoingCall.callId);
          await call.endCall();
        } catch (e) { }
      }
      if (incomingCall) {
        try { await incomingCall.leave({ reject: true }); } catch (e) { }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeCall, outgoingCall, incomingCall, client]);

  // ==================== OUTGOING CALL LOGIC ====================
  useEffect(() => {
    if (!client || !outgoingCall) return;

    const { callType, callId } = outgoingCall;
    const call = client.call(callType, callId);

    let hasJoined = false;

    const timeout = setTimeout(async () => {
      if (!hasJoined) {
        try {
          await call.endCall();
        } catch (e) {
          console.error('Error ending call on timeout:', e);
        }
        setOutgoingCall(null);
        toast('Không có phản hồi, đã hủy cuộc gọi');
      }
    }, 60000);

    const onParticipantJoined = () => {
      //console.log('=== PARTICIPANT JOINED (Outgoing Call) ===');
      //console.log('Event:', ev);
      //console.log('Participant:', ev.participant);
//
      //const participantUserId = ev.participant?.userId;
      //const currentUserSanitized = client.userId;
//
      //// Sanitize for comparison
      //const sanitizedParticipantId = participantUserId ? sanitizeUserId(participantUserId) : null;
//
      //console.log('Participant ID (sanitized):', sanitizedParticipantId);
      //console.log('Current User ID:', currentUserSanitized);
      //console.log('Are different?:', sanitizedParticipantId !== currentUserSanitized);

      if (hasJoined) {
        console.log('Already joined, skipping');
        return;
      }
      hasJoined = true;
      clearTimeout(timeout);

      call.join().then(() => {
        setActiveCall(call);
        setOutgoingCall(null);
      }).catch(err => {
        console.error('Caller auto-join failed', err);
        setOutgoingCall(null);
      });

      // Check if it's the receiver (not caller) who joined
      //if (sanitizedParticipantId && sanitizedParticipantId !== currentUserSanitized) {
      //  console.log('>>> RECEIVER JOINED! Auto-joining as caller...');
      //  hasJoined = true;
      //  clearTimeout(timeout);
//
      //  call.join().then(() => {
      //    console.log('Caller joined successfully');
      //    setActiveCall(call);
      //    setOutgoingCall(null);
      //    toast.success('Đã kết nối');
      //  }).catch(err => {
      //    console.error('Caller auto-join failed', err);
      //    setOutgoingCall(null);
      //    toast.error('Không thể tham gia cuộc gọi');
      //  });
      //} else {
      //  console.log('Skipped: Same user or no participant ID');
      //}
    };

    const onParticipantLeft = (ev) => {
      //const userId = ev.participant?.user_id;
      //const sanitizedUserId = userId ? sanitizeUserId(userId) : null;
      //const currentUserSanitized = client.user?.id;
//
      //if (sanitizedUserId && sanitizedUserId !== currentUserSanitized && !hasJoined) {
      //  clearTimeout(timeout);
      //  setOutgoingCall(null);
      //  toast('Cuộc gọi bị từ chối');
      //}
      const userId = ev.participant?.user_id;
      if (userId && userId !== client.user.id && !hasJoined) {
        clearTimeout(timeout);
        setOutgoingCall(null);
        toast('Cuộc gọi bị từ chối');
      }
    };

    const onCallEnded = () => {
      clearTimeout(timeout);
      setOutgoingCall(null);
      setActiveCall(null);
    };

    call.on('call.session_participant_joined', onParticipantJoined);
    call.on('call.session_participant_left', onParticipantLeft);
    call.on('call.ended', onCallEnded);

    return () => {
      clearTimeout(timeout);
      call.off('call.session_participant_joined', onParticipantJoined);
      call.off('call.session_participant_left', onParticipantLeft);
      call.off('call.ended', onCallEnded);
    };
  }, [client, outgoingCall]);

  // ==================== INCOMING CALL LOGIC ====================
  useEffect(() => {
    if (!client || !incomingCall) return;

    const timeout = setTimeout(async () => {
      try {
        await incomingCall.leave({ reject: true });
      } catch (e) {
        console.error('Error rejecting call on timeout:', e);
      }
      setIncomingCall(null);
      toast('Cuộc gọi đến đã hết hạn');
    }, 60000);

    const onCallEnded = () => {
      clearTimeout(timeout);
      setIncomingCall(null);
    };

    incomingCall.on('call.ended', onCallEnded);

    return () => {
      clearTimeout(timeout);
      incomingCall.off('call.ended', onCallEnded);
    };
  }, [client, incomingCall]);

  // ==================== ACTIVE CALL LOGIC ====================
  useEffect(() => {
    if (!activeCall || !client) return;

    const onCallEnded = () => {
      setActiveCall(null);
      setIncomingCall(null);
      setOutgoingCall(null);
      toast('Cuộc gọi đã kết thúc');
    };

    const onParticipantLeft = (ev) => {
      const userId = ev.participant?.user_id;
      const sanitizedUserId = userId ? sanitizeUserId(userId) : null;
      const currentUserSanitized = client.user?.id;

      if (sanitizedUserId && sanitizedUserId !== currentUserSanitized) {
        setActiveCall(null);
        setIncomingCall(null);
        setOutgoingCall(null);
        toast('Người kia đã rời khỏi cuộc gọi');
      }
    };

    activeCall.on('call.ended', onCallEnded);
    activeCall.on('call.session_participant_left', onParticipantLeft);

    return () => {
      activeCall.off('call.ended', onCallEnded);
      activeCall.off('call.session_participant_left', onParticipantLeft);
    };
  }, [activeCall, client]);

  // ==================== ACTIONS ====================
  const startCall = useCallback(({ callId, callType, receiverName, isAudioOnly = false }) => {
    setOutgoingCall({ callId, callType, receiverName, isAudioOnly, startedAt: Date.now() });
  }, []);

  const cancelOutgoing = useCallback(async () => {
    if (!client || !outgoingCall) {
      setOutgoingCall(null);
      return;
    }
    const call = client.call(outgoingCall.callType, outgoingCall.callId);
    try {
      await call.endCall();
    } catch (e) {
      console.error('Error cancelling outgoing call:', e);
    }
    setOutgoingCall(null);
  }, [client, outgoingCall]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      await incomingCall.join();
      setActiveCall(incomingCall);
      setIncomingCall(null);
      setOutgoingCall(null);
      toast.success('Đã tham gia cuộc gọi');
    } catch (e) {
      console.error('acceptCall error', e);
      toast.error('Không thể tham gia cuộc gọi');
    }
  }, [incomingCall]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall) {
      setIncomingCall(null);
      return;
    }
    try {
      await incomingCall.leave({ reject: true });
    } catch (e) { }
    setIncomingCall(null);
  }, [incomingCall]);

  const endCall = useCallback(async () => {
    if (!activeCall) return;
    try {
      await activeCall.leave();
    } catch (e) { }
    setActiveCall(null);
  }, [activeCall]);

  const value = {
    client,
    incomingCall,
    outgoingCall,
    activeCall,
    startCall,
    cancelOutgoing,
    acceptCall,
    rejectCall,
    endCall,
    setOutgoingCall,
    setIncomingCall,
    setActiveCall,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export default CallContext;
