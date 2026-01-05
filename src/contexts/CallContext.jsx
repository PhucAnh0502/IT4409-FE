
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

  // Fallback: Nếu incomingCall đã kết thúc (hasEnded: true) thì tự động tắt modal
  useEffect(() => {
    if (incomingCall && incomingCall.state?.hasEnded) {
      setIncomingCall(null);
    }
  }, [incomingCall]);

  // Initialize StreamVideoClient
  useEffect(() => {
    const authToken = getToken();


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

        const streamToken = await getStreamToken(currentUserId);



        if (!streamToken) {
          console.error('Stream token is null or undefined');
          return;
        }

        const apiKey = import.meta.env.VITE_GETSTREAM_API_KEY;

        if (!apiKey) {
          console.error('VITE_GETSTREAM_API_KEY is not defined in .env');
          console.error('Please add VITE_GETSTREAM_API_KEY to your .env file');
          return;
        }
        let userName = authUser?.userName;

        const videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: sanitized,
            name: userName || sanitized
          },
          token: streamToken,
        });



        if (!mounted) {

          return;
        }

        setClient(videoClient);


        // Check for any pending/ringing calls that may have been initiated while user was offline
        const checkForPendingCalls = async () => {
          try {


            // Query for calls where current user is a member
            const { calls } = await videoClient.queryCalls({
              filter_conditions: {
                members: { $in: [sanitized] }
              },
              sort: [{ field: 'created_at', direction: -1 }], // Keep as is, we'll sort manually
              limit: 10,
            });



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

              // Calculate call age to filter out old/stale calls
              const callAge = Date.now() - new Date(state.createdAt).getTime();
              const MAX_CALL_AGE = 60000; // 60 seconds - only show recent calls



              // Check if call is active and waiting for this user to join
              // Only show calls that are actively ringing and created recently (within 60 seconds)
              if (!hasEnded && state.createdBy?.id !== sanitized && !hasJoined &&
                state.callingState === 'ringing' && // Must be ringing (removed hasSession check to prevent stale calls)
                callAge < MAX_CALL_AGE && // Only show recent calls to prevent phantom calls from old sessions
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



            // Sort valid calls by createdAt ascending (oldest first)
            validCalls.sort((a, b) => a.createdAt - b.createdAt);

            // Show the first (oldest) call
            if (validCalls.length > 0) {
              const firstCall = validCalls[0];

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
        try { await incomingCall.reject(); } catch (e) { }
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



      // GetStream structure: ev.participant.user.id (nested, not ev.participant.user_id)
      const participantUserId = ev.participant?.user?.id || ev.participant?.userId || ev.user?.id;
      // Sanitize both IDs for proper comparison
      const sanitizedParticipantId = sanitizeUserId(participantUserId);
      const sanitizedCurrentUserId = sanitizeUserId(currentUserId);



      if (!participantUserId) {
        console.error('Could not extract participant user ID from event');
        return;
      }

      //  Nếu chính mình join → bỏ qua
      if (sanitizedParticipantId === sanitizedCurrentUserId) {

        return;
      }

      //  Receiver đã join

      hasJoinedRef.current = true;
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

    // Listen for call.rejected event - when receiver explicitly rejects (1-on-1 call only)
    const onCallRejected = async (ev) => {
      const rejectedBy = ev.user?.id;

      // Only handle rejection for 1-on-1 calls
      const participantCount = call.state?.custom?.participantCount || 2;
      if (participantCount === 2) {
        clearTimeout(timeout);
        clearTimeout(fallbackCheck);
        setOutgoingCall(null);
        toast.error('Người nhận đã từ chối cuộc gọi');

        // End the call from caller side
        try {
          await call.endCall();
        } catch (e) {
          console.error('Error ending call after rejection:', e);
        }
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
    call.on('call.rejected', onCallRejected);
    call.on('call.ended', onCallEnded);

    return () => {
      clearTimeout(timeout);
      clearTimeout(fallbackCheck);
      call.off('call.session_participant_joined', onParticipantJoined);
      call.off('call.session_participant_left', onParticipantLeft);
      call.off('call.rejected', onCallRejected);
      call.off('call.ended', onCallEnded);
    };
  }, [client, outgoingCall]);

  // ==================== INCOMING CALL LOGIC ====================
  useEffect(() => {
    if (!client || !incomingCall) return;

    const timeout = setTimeout(async () => {
      try {
        await incomingCall.reject();
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

    // Khi tất cả mọi người đã rời khỏi cuộc gọi (group call kết thúc), tắt incoming call modal
    const onSessionEnded = () => {
      clearTimeout(timeout);
      setIncomingCall(null);
      toast('Cuộc gọi đã kết thúc (mọi người đã rời)');
    };

    incomingCall.on('call.ended', onCallEnded);
    incomingCall.on('call.session_ended', onSessionEnded);

    return () => {
      clearTimeout(timeout);
      incomingCall.off('call.ended', onCallEnded);
      incomingCall.off('call.session_ended', onSessionEnded);
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
      // Use reject() instead of leave({ reject: true }) per GetStream best practices
      // This allows caller to receive call.rejected event and handle properly
      await incomingCall.reject();
    } catch (e) {
      console.error('Error rejecting call:', e);
    }
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
