import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { getStreamToken } from '../lib/tokenService';
import { sanitizeUserId } from '../lib/callHelpers';
import { getUserIdFromToken, getToken } from '../lib/utils';
import { getUserName } from '../lib/userService';
import toast from 'react-hot-toast';

const CallContext = createContext(null);

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
};

export const CallProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  const currentUserId = getUserIdFromToken();

  // Hàm khởi tạo client chỉ khi cần thiết (Lazy Init)
  const initClient = useCallback(async () => {
    if (client) return client; // Đã có thì trả về luôn

    const authToken = getToken();
    if (!currentUserId || !authToken) {
      throw new Error("User chưa đăng nhập hoặc thiếu ID");
    }

    try {
      const apiKey = import.meta.env.VITE_GETSTREAM_API_KEY;
      const streamToken = await getStreamToken(currentUserId);
      const userName = await getUserName(currentUserId);
      const sanitized = sanitizeUserId(currentUserId);

      const videoClient = new StreamVideoClient({
        apiKey,
        user: {
          id: currentUserId,
          name: userName,
        },
        token: streamToken,
      });

      // Lắng nghe cuộc gọi đến ngay khi client vừa được tạo
      videoClient.on('call.ring', (ev) => {
        const callCid = ev.call?.cid;
        if (!callCid) return;
        const [callType, callId] = callCid.split(':');
        const call = videoClient.call(callType, callId);
        const callerName = ev.call?.custom?.callerName || ev.call?.created_by?.name || 'Someone';
        const isAudioOnly = ev.call?.custom?.isAudioOnly || false;
        setIncomingCall({ ...call, callerName, isAudioOnly });
      });

      setClient(videoClient);
      return videoClient;
    } catch (e) {
      console.error('❌ StreamVideo lazy init error:', e);
      throw e;
    }
  }, [currentUserId, client]);

  // Cleanup khi logout hoặc đóng app
  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser();
        setClient(null);
      }
    };
  }, [currentUserId]);

  const startCall = useCallback(({ callId, callType, receiverName, isAudioOnly = false }) => {
    setOutgoingCall({ callId, callType, receiverName, isAudioOnly, startedAt: Date.now() });
  }, []);

  const cancelOutgoing = useCallback(async () => {
    if (!client || !outgoingCall) {
      setOutgoingCall(null);
      return;
    }
    const call = client.call(outgoingCall.callType, outgoingCall.callId);
    try { await call.endCall(); } catch (e) { }
    setOutgoingCall(null);
  }, [client, outgoingCall]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      await incomingCall.join();
      setActiveCall(incomingCall);
      setIncomingCall(null);
    } catch (e) { toast.error('Không thể tham gia cuộc gọi'); }
  }, [incomingCall]);

  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;
    try { await incomingCall.leave({ reject: true }); } catch (e) { }
    setIncomingCall(null);
  }, [incomingCall]);

  const endCall = useCallback(async () => {
    if (!activeCall) return;
    try { await activeCall.leave(); } catch (e) { }
    setActiveCall(null);
  }, [activeCall]);

  const value = {
    client,
    initClient, // Export hàm này để ChatHeader gọi
    incomingCall, outgoingCall, activeCall,
    startCall, cancelOutgoing, acceptCall, rejectCall, endCall,
    setOutgoingCall, setIncomingCall, setActiveCall,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export default CallContext;