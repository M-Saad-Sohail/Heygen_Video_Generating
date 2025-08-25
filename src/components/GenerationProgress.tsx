import { useEffect, useState } from 'react';

interface GenerationProgressProps {
  videoId: string;
  onComplete: (videoUrl: string) => void;
}

const loadingMessages = [
  "Warming up the AI engines... 🚀",
  "Teaching the avatar your script... 📚",
  "Adjusting facial expressions... 😊",
  "Fine-tuning the voice... 🎤",
  "Adding natural gestures... 👋",
  "Polishing the final touches... ✨",
  "Making it look perfect... 🎬",
  "Almost there... ⭐",
];

interface VideoStatusResponse {
  code: number;
  message: string;
  data: {
    callback_id: string | null;
    caption_url: string | null;
    duration: number | null;
    error: {
      code: number;
      detail: string;
      message: string;
    } | null;
    gif_url: string | null;
    id: string;
    status: 'pending' | 'processing' | 'waiting' | 'completed' | 'failed';
    thumbnail_url: string | null;
    video_url: string | null;
    video_url_caption: string | null;
  };
}

export default function GenerationProgress({ videoId, onComplete }: GenerationProgressProps) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'waiting' | 'completed' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Rotate through messages every 3 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/check-status?videoId=${videoId}`);
        const response: VideoStatusResponse = await res.json();
        
        if (response.code !== 100) {
          setError('Unexpected response from server');
          setStatus('failed');
          return;
        }
        
        setStatus(response.data.status);
        
        if (response.data.error) {
          setError(response.data.error.detail || response.data.error.message);
        } else if (response.data.status === 'completed' && response.data.video_url) {
          onComplete(response.data.video_url);
        }
      } catch (err) {
        setError('Failed to check video status');
        setStatus('failed');
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [videoId, onComplete]);

  if (status === 'failed') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="mb-4 text-red-500">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="mt-4 text-lg font-semibold">Failed to generate video</p>
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center">
        <div className="relative mb-6">
          {/* AI Working Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 border-4 border-blue-200 rounded-full border-b-transparent animate-spin-slow"></div>
              <div className="absolute inset-4 border-4 border-blue-300 rounded-full border-l-transparent animate-spin"></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-progress"></div>
          </div>
        </div>

        {/* Status Message */}
        <p className="text-lg font-medium text-gray-800 mb-2">
          {status === 'processing' ? 'Processing your video...' : 'Waiting in queue...'}
        </p>
        
        {/* Rotating Messages */}
        <p className="text-sm text-gray-600 transition-opacity duration-300 animate-pulse">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
} 