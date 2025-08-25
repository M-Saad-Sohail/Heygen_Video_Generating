import { useEffect, useState } from 'react';

interface ProgressModalProps {
  videoId: string;
  onComplete: (videoUrl: string) => void;
  onClose: () => void;
}

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

export default function ProgressModal({ videoId, onComplete, onClose }: ProgressModalProps) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'waiting' | 'completed' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Generating Your Video</h3>
          
          {(status === 'pending' || status === 'waiting') && (
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4">Waiting in queue...</p>
            </div>
          )}
          
          {status === 'processing' && (
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4">Processing your video...</p>
            </div>
          )}
          
          {status === 'completed' && (
            <div className="mb-4 text-green-500">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="mt-4">Video generated successfully!</p>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="mb-4 text-red-500">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="mt-4">Failed to generate video</p>
              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 