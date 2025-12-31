
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
  const hasJoinedRef = useRef(false); // Track if receiver has joined

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

          // Attach metadata to call object so UI components can access it
          setIncomingCall({
            ...call,
            callerName,
            isAudioOnly,
            participantCount
          });
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

  // ==================== HELPER FUNCTION ====================
  // Check if a call is 1-on-1 based on participantCount in custom metadata
  const isOneOnOneCall = (call) => {
    // Try to get participantCount from custom metadata
    // Default to 2 if not available (assume 1-on-1 for safety)
    const participantCount = call?.state?.custom?.participantCount ||
      call?.custom?.participantCount ||
      2;
    return participantCount === 2;
  };

  // ==================== OUTGOING CALL LOGIC ====================
  useEffect(() => {
    if (!client || !outgoingCall) return;

    const { callType, callId } = outgoingCall;
    const call = client.call(callType, callId);

    // Reset hasJoinedRef when outgoingCall starts
    hasJoinedRef.current = false;

    const timeout = setTimeout(async () => {
      if (!hasJoinedRef.current) {
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
      if (hasJoinedRef.current) return;

      // Log the entire event to understand structure
      console.log('Full event object:', {
        event: ev,
        participant: ev.participant,
        user: ev.user,
        callCid: ev.call_cid
      });

      // GetStream structure: ev.participant.user.id (nested, not ev.participant.user_id)
      const participantUserId = ev.participant?.user?.id || ev.participant?.userId || ev.user?.id;
      // Sanitize both IDs for proper comparison
      const sanitizedParticipantId = sanitizeUserId(participantUserId);
      const sanitizedCurrentUserId = sanitizeUserId(currentUserId);

      console.log('Outgoing call - participant joined:', {
        participantUserId,
        sanitizedParticipantId,
        sanitizedCurrentUserId,
        isCurrentUser: sanitizedParticipantId === sanitizedCurrentUserId,
        hasJoined: hasJoinedRef.current
      });

      if (!participantUserId) {
        console.error('Could not extract participant user ID from event');
        return;
      }

      //  Nếu chính mình join → bỏ qua
      if (sanitizedParticipantId === sanitizedCurrentUserId) {
        console.log('Skipping - current user joined');
        return;
      }

      //  Receiver đã join
      console.log('Receiver joined! Caller auto-joining...');
      hasJoinedRef.current = true;
      clearTimeout(timeout);

      call.join()
        .then(() => {
          console.log('Caller successfully joined active call');
          setActiveCall(call);
          setOutgoingCall(null);
          toast.success('Đã kết nối');
        })
        .catch(err => {
          console.error('Caller auto-join failed', err);
          setOutgoingCall(null);
        });
    };

    // Fallback: after 2 seconds, check if receiver has joined but event was missed
    const fallbackCheck = setTimeout(async () => {
      if (hasJoinedRef.current) return;
      try {
        await call.get();
        const participants = call.state?.participants || [];
        // If there are 2+ participants and one is not the current user, force join
        const sanitizedCurrentUserId = sanitizeUserId(currentUserId);
        const other = participants.find(p => sanitizeUserId(p.userId) !== sanitizedCurrentUserId);
        if (other) {
          console.log('Fallback: Detected receiver joined, forcing caller to join.');
          hasJoinedRef.current = true;
          clearTimeout(timeout);
          await call.join();
          setActiveCall(call);
          setOutgoingCall(null);
          toast.success('Đã kết nối (fallback)');
        }
      } catch (e) {
        // ignore
      }
    }, 2000);

    const onParticipantLeft = (ev) => {
      const userId = ev.participant?.user_id;
      const sanitizedUserId = sanitizeUserId(userId);
      const sanitizedCurrentUserId = sanitizeUserId(currentUserId);

      if (sanitizedUserId && sanitizedUserId !== sanitizedCurrentUserId && !hasJoinedRef.current) {
        clearTimeout(timeout);
        clearTimeout(fallbackCheck);
        setOutgoingCall(null);
        toast('Cuộc gọi bị từ chối');
      }
    };

    const onCallEnded = () => {
      clearTimeout(timeout);
      clearTimeout(fallbackCheck);
      setOutgoingCall(null);
      setActiveCall(null);
    };

    call.on('call.session_participant_joined', onParticipantJoined);
    call.on('call.session_participant_left', onParticipantLeft);
    call.on('call.ended', onCallEnded);

    return () => {
      clearTimeout(timeout);
      clearTimeout(fallbackCheck);
      call.off('call.session_participant_joined', onParticipantJoined);
      call.off('call.session_participant_left', onParticipantLeft);
      call.off('call.ended', onCallEnded);
    };
  }, [client, outgoingCall]);

  // ==================== INCOMING CALL LOGIC ====================
  useEffect(() => {
    if (!client || !incomingCall) return;

    // Timeout: auto-reject after 60s if not answered
    const timeout = setTimeout(async () => {
      try {
        await incomingCall.leave({ reject: true });
      } catch (e) {
        console.error('Error rejecting call on timeout:', e);
      }
      setIncomingCall(null);
      toast('Cuộc gọi đến đã hết hạn');
    }, 60000);

    // Event: call ended (by all participants or ended by server)
    const onCallEnded = () => {
      clearTimeout(timeout);
      setIncomingCall(null);
      toast('Cuộc gọi đã kết thúc');
    };

    // Event: session ended (all participants left)
    const onSessionEnded = () => {
      clearTimeout(timeout);
      setIncomingCall(null);
      toast('Cuộc gọi đã kết thúc (mọi người đã rời)');
    };

    // Attach listeners to the correct call object
    if (typeof incomingCall.on === 'function') {
      incomingCall.on('call.ended', onCallEnded);
      incomingCall.on('call.session_ended', onSessionEnded);
    }

    // Fallback polling: check every 2s if call has ended (in case event missed)
    const poll = setInterval(() => {
      if (incomingCall?.state?.hasEnded) {
        clearTimeout(timeout);
        setIncomingCall(null);
        toast('Cuộc gọi đã kết thúc');
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      clearInterval(poll);
      if (typeof incomingCall.off === 'function') {
        incomingCall.off('call.ended', onCallEnded);
        incomingCall.off('call.session_ended', onSessionEnded);
      }
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
      const currentUserSanitized = sanitizeUserId(currentUserId);

      if (sanitizedUserId && sanitizedUserId !== currentUserSanitized) {
        // For 1-on-1 calls: immediately end the call when the other person leaves
        if (isOneOnOneCall(activeCall)) {
          setActiveCall(null);
          setIncomingCall(null);
          setOutgoingCall(null);
          toast('Người kia đã rời khỏi cuộc gọi');
        }
        // For group calls: only show notification, don't end call
        else {
          toast('Một người đã rời khỏi cuộc gọi');
        }
      }
    };

    // For group calls: end active call if session ends (all participants left)
    const onSessionEnded = () => {
      if (!isOneOnOneCall(activeCall)) {
        setActiveCall(null);
        setIncomingCall(null);
        setOutgoingCall(null);
        toast('Tất cả mọi người đã rời khỏi cuộc gọi');
      }
    };

    activeCall.on('call.ended', onCallEnded);
    activeCall.on('call.session_participant_left', onParticipantLeft);
    activeCall.on('call.session_ended', onSessionEnded);

    return () => {
      activeCall.off('call.ended', onCallEnded);
      activeCall.off('call.session_participant_left', onParticipantLeft);
      activeCall.off('call.session_ended', onSessionEnded);
    };
  }, [activeCall, client]);

  // ==================== ACTIONS ====================
  // Sửa: nhận thêm participants và conversationId để hỗ trợ group call
  const startCall = useCallback(({ callId, callType, receiverName, isAudioOnly = false, participants = [], conversationId = null, call = null }) => {
    setOutgoingCall({
      callId,
      callType,
      receiverName,
      isAudioOnly,
      startedAt: Date.now(),
      participants,
      conversationId,
      call, // lưu lại call object nếu có
    });
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
