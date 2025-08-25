import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Types from the SDK
type StreamingAvatar = any;
interface StreamingEvents {
  AVATAR_START_TALKING: string;
  AVATAR_STOP_TALKING: string;
  STREAM_READY: string;
  STREAM_DISCONNECTED: string;
}

interface InteractiveAvatarProps {
  avatarId: string;
  voiceId: string;
}

// Load the SDK dynamically on the client side
const loadStreamingAvatar = async () => {
  const module = await import('@heygen/streaming-avatar');
  return {
    StreamingAvatar: module.default,
    StreamingEvents: module.StreamingEvents,
    AvatarQuality: module.AvatarQuality,
    TaskType: module.TaskType,
    VoiceEmotion: module.VoiceEmotion,
  };
};

export default function InteractiveAvatar({ avatarId, voiceId }: InteractiveAvatarProps) {
  const [streamingAvatar, setStreamingAvatar] = useState<StreamingAvatar | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTalking, setIsTalking] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inputText, setInputText] = useState('');
  const [sdkModules, setSdkModules] = useState<any>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Load SDK modules when component mounts
    loadStreamingAvatar().then(setSdkModules).catch(console.error);

    return () => {
      // Cleanup function to stop avatar when component unmounts
      if (streamingAvatar) {
        streamingAvatar.stopAvatar();
      }
    };
  }, [streamingAvatar]);

  // Attach media stream to video element whenever both are ready
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const initializeAvatar = async () => {
    if (!sdkModules) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Get streaming token
      const tokenResponse = await fetch('/api/create-token', {
        method: 'POST',
      });
      const tokenData = await tokenResponse.json();

      if (!tokenData.data?.token) {
        throw new Error('Failed to get streaming token');
      }

      // Initialize streaming avatar
      const avatar = new sdkModules.StreamingAvatar({ 
        token: tokenData.data.token,
      });

      // Set up event listeners
      avatar.on(sdkModules.StreamingEvents.AVATAR_START_TALKING, () => setIsTalking(true));
      avatar.on(sdkModules.StreamingEvents.AVATAR_STOP_TALKING, () => setIsTalking(false));
      avatar.on(sdkModules.StreamingEvents.STREAM_READY, (event: any) => {
        console.log("STREAM_READY event", event);
        if (event.detail) {
          setMediaStream(event.detail as MediaStream);
        }
      });
      avatar.on(sdkModules.StreamingEvents.STREAM_DISCONNECTED, () => {
        setError('Stream disconnected');
        setMediaStream(null);
      });

      // Start avatar session
      const sessionInfo = await avatar.createStartAvatar({
        quality: 'high',
     
        activityIdleTimeout: 300,
        version: 'v2',
        videoEncoding: 'H264'
      });

      setStreamingAvatar(avatar);
      // ensure mediaStream state resets if avatar restarts without STREAM_READY event yet
      setMediaStream(null);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error initializing avatar:", err);
      setError(err.message || 'Failed to initialize avatar');
      setIsLoading(false);
    }
  };

  const handleSendText = async () => {
    if (!streamingAvatar || !inputText.trim() || !sdkModules) return;

    try {
      await streamingAvatar.speak({
        text: inputText,
        task_type: sdkModules.TaskType.TALK,
      });
      setInputText('');
    } catch (err: any) {
      setError(err.message || 'Failed to send text');
    }
  };

  const toggleVoiceChat = async () => {
    if (!streamingAvatar) return;

    try {
      if (isVoiceChatActive) {
        await streamingAvatar.closeVoiceChat();
        setIsVoiceChatActive(false);
      } else {
        await streamingAvatar.startVoiceChat({
          isInputAudioMuted: false,
          useSilencePrompt: true
        });
        setIsVoiceChatActive(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle voice chat');
    }
  };

  const handleInterrupt = async () => {
    if (!streamingAvatar) return;
    try {
      await streamingAvatar.interrupt();
    } catch (err: any) {
      setError(err.message || 'Failed to interrupt avatar');
    }
  };

  return (
    <div className="space-y-4">
      {!streamingAvatar && (
        <button
          onClick={initializeAvatar}
          disabled={isLoading || !sdkModules}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Initializing...' : 'Start Interactive Avatar'}
        </button>
      )}

      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {streamingAvatar && (
        <div className="space-y-4">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            {isTalking && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                Speaking...
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={toggleVoiceChat}
              className={`px-4 py-2 rounded ${
                isVoiceChatActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {isVoiceChatActive ? 'Stop Voice Chat' : 'Start Voice Chat'}
            </button>
            {isTalking && (
              <button
                onClick={handleInterrupt}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Interrupt
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
            />
            <button
              onClick={handleSendText}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 