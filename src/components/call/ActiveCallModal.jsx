import React, { useState, useEffect } from 'react';
import { StreamVideo, StreamCall, SpeakerLayout } from '@stream-io/video-react-sdk';
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

  return (
    <div className="fixed inset-0 z-[9999] bg-base-300">
      <StreamVideo client={client}>
        <StreamCall call={activeCall}>
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 via-black/40 to-transparent p-6">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {isAudioOnly ? (
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center"><User className="w-5 h-5 text-success" /></div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><VideoIcon className="w-5 h-5 text-primary" /></div>
                    )}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{isAudioOnly ? 'Audio Call' : 'Video Call'}</h3>
                      <p className="text-white/70 text-sm">{formatDuration(callDuration)}</p>
                    </div>
                  </div>
                </div>
                <button onClick={endCall} className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all" title="Close"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200">
              <div className="w-full h-full max-w-7xl mx-auto p-4 pt-24 pb-32">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-base-100 shadow-2xl border border-base-300">
                  <SpeakerLayout />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pb-8">
              <div className="max-w-2xl mx-auto">
                <div className="bg-base-100/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-base-300">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={toggleMic} className={`w-14 h-14 rounded-full ${isMicOn ? 'bg-base-200' : 'bg-error text-white'}`} title="Mic">{isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}</button>
                    {!isAudioOnly && <button onClick={toggleVideo} className={`w-14 h-14 rounded-full ${isVideoOn ? 'bg-base-200' : 'bg-error text-white'}`} title="Camera">{isVideoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}</button>}
                    {!isAudioOnly && <button onClick={toggleScreen} className="w-14 h-14 rounded-full bg-base-200" title="Screen Share"><MonitorUp className="w-6 h-6" /></button>}
                    <button onClick={endCall} className="w-14 h-14 rounded-full bg-error text-white" title="End"><PhoneOff className="w-6 h-6" /></button>
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
