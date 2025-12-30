import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Use refs to track current call states for event handlers (to avoid stale closure)
  const incomingCallRef = useRef(null);
  const outgoingCallRef = useRef(null);
  const activeCallRef = useRef(null);

  // Update refs whenever state changes
  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    outgoingCallRef.current = outgoingCall;
  }, [outgoingCall]);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

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
        //console.log('Getting Stream token for:', sanitized);

        const streamToken = await getStreamToken(currentUserId);

        //console.log('Stream token received');
        //console.log('Stream token type:', typeof streamToken);
        //console.log('Stream token length:', streamToken?.length);

        if (!streamToken) {
          console.error('Stream token is null or undefined');
          return;
        }

        const apiKey = import.meta.env.VITE_GETSTREAM_API_KEY;
        //console.log('GetStream API Key from .env:', apiKey ? 'Present' : 'MISSING');

        if (!apiKey) {
          console.error('VITE_GETSTREAM_API_KEY is not defined in .env');
          console.error('Please add VITE_GETSTREAM_API_KEY to your .env file');
          return;
        }

        //console.log('Fetching userName from API for userId:', currentUserId);
        let userName = authUser?.userName;
        //if (!userName) {
        //  console.log('Fetching userName from API for userId:', currentUserId);
        //  userName = await getUserName(currentUserId);
        //  console.log('Fetched userName:', userName);
        //}

        //console.log('Creating StreamVideoClient with:', {
        //  apiKey: apiKey.substring(0, 10) + '...',
        //  userId: sanitized,
        //  userName: userName || sanitized,
        //  tokenLength: streamToken.length
        //});

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

        // Check for any pending/ringing calls that may have been initiated while user was offline
        const checkForPendingCalls = async () => {
          try {
            console.log('Checking for pending calls...');

            // Query for calls where current user is a member
            const { calls } = await videoClient.queryCalls({
              filter_conditions: {
                members: { $in: [sanitized] }
              },
              sort: [{ field: 'created_at', direction: -1 }], // Keep as is, we'll sort manually
              limit: 10,
            });

            console.log('Found calls:', calls.length);

            // Collect all valid pending calls
            const validCalls = [];

            for (const call of calls) {
              // Get the call state to check if it's ringing
              await call.get();

              const state = call.state;
              const participants = state.participants || [];
              const currentUserParticipant = participants.find(p => p.userId === sanitized);
              const hasJoined = currentUserParticipant?.joinedAt != null;
              const hasSession = state.session != null;
              const hasEnded = state.endedAt != null;

              console.log('Call state:', {
                id: call.id,
                callingState: state.callingState,
                hasSession,
                hasEnded,
                hasJoined,
                participantCount: participants.length,
                createdBy: state.createdBy?.id,
                createdAt: state.createdAt,
                custom: state.custom
              });

              // Check if call is active and waiting for this user to join
              if (!hasEnded && state.createdBy?.id !== sanitized && !hasJoined &&
                (state.callingState === 'ringing' || hasSession) &&
                !incomingCall && !outgoingCall && !activeCall) {

                validCalls.push({
                  call,
                  createdAt: new Date(state.createdAt).getTime(),
                  callerName: state.custom?.callerName || state.createdBy?.name || 'Someone',
                  isAudioOnly: state.custom?.isAudioOnly || false,
                  participantCount: state.custom?.participantCount || 2 // Default to 2 if not specified
                });
              }
            }

            console.log('Valid pending calls:', validCalls.length);

            // Sort valid calls by createdAt ascending (oldest first)
            validCalls.sort((a, b) => a.createdAt - b.createdAt);

            // Show the first (oldest) call
            if (validCalls.length > 0) {
              const firstCall = validCalls[0];
              console.log('Showing oldest pending call:', firstCall.call.id, 'created at', new Date(firstCall.createdAt));

              setIncomingCall({
                ...firstCall.call,
                callerName: firstCall.callerName,
                isAudioOnly: firstCall.isAudioOnly,
                participantCount: firstCall.participantCount
              });
            }
          } catch (error) {
            console.error('Error checking for pending calls:', error);
          }
        };

        // Check for pending calls after client is ready
        checkForPendingCalls();

        // Listen for incoming ringing calls
        videoClient.on('call.ring', (ev) => {
          // Reject if user is already busy with any call (use refs to get latest state)
          if (incomingCallRef.current || outgoingCallRef.current || activeCallRef.current) {
            console.log('User is busy, rejecting incoming call');
            return;
          }

          const callCid = ev.call?.cid;
          if (!callCid) return;
          const [callType, callId] = callCid.split(':');
          const call = videoClient.call(callType, callId);

          const callerName = ev.call?.custom?.callerName || ev.call?.created_by?.name || 'Someone';
          const isAudioOnly = ev.call?.custom?.isAudioOnly || false;
          const participantCount = ev.call?.custom?.participantCount || 2;

          setIncomingCall({ ...call, callerName, isAudioOnly, participantCount });
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

    const onParticipantJoined = (ev) => {
      if (hasJoined) return;

      const participantUserId = ev.participant?.userId;
      const currentUserId = client.user.id;

      if (!participantUserId) return;

      //  Nếu chính mình join → bỏ qua
      if (participantUserId === currentUserId) {
        return;
      }

      //  Receiver đã join
      hasJoined = true;
      clearTimeout(timeout);

      call.join()
        .then(() => {
          setActiveCall(call);
          setOutgoingCall(null);
          toast.success('Đã kết nối');
        })
        .catch(err => {
          console.error('Caller auto-join failed', err);
          setOutgoingCall(null);
        });
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
