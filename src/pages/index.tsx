import { useState } from 'react';
import GenerationProgress from '../components/GenerationProgress';
import CustomizationSidebar from '../components/CustomizationSidebar';
import AvatarVoiceSelector from '../components/AvatarVoiceSelector';

interface GenerateVideoResponse {
  error: null | {
    message: string;
  };
  data: {
    video_id: string;
  };
}

interface Background {
  type: 'color' | 'image' | 'video';
  value?: string;
  url?: string;
  play_style?: 'fit_to_scene' | 'freeze' | 'loop' | 'once';
  fit?: 'cover' | 'crop' | 'contain' | 'none';
}

export default function Home() {
  const [script, setScript] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [background, setBackground] = useState<Background>({
    type: 'color',
    value: '#FAFAFA'
  });
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');

  const generateVideo = async () => {
    if (!selectedAvatar || !selectedVoice) {
      alert('Please select both an avatar and a voice');
      return;
    }

    try {
      setIsGenerating(true);
      
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          script,
          background,
          avatar_id: selectedAvatar,
          voice_id: selectedVoice
        }),
      });

      const data: GenerateVideoResponse = await res.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setVideoId(data.data.video_id);
    } catch (error) {
      console.error('Failed to generate video:', error);
      alert('Failed to generate video. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleVideoComplete = (url: string) => {
    setVideoUrl(url);
    setVideoId(''); // Reset video ID to hide progress
    setIsGenerating(false);
  };

  const handleAvatarVoiceSelect = (avatarId: string, voiceId: string) => {
    setSelectedAvatar(avatarId);
    setSelectedVoice(voiceId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">HeyGen AI Video Generator</h1>
          <p className="text-lg text-gray-600">Transform your text into engaging AI-powered videos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <CustomizationSidebar onBackgroundChange={setBackground} />
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Avatar and Voice Selector */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <AvatarVoiceSelector onSelect={handleAvatarVoiceSelect} />
            </div>

            {/* Script Input */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <label htmlFor="script" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Script
                </label>
                <textarea
                  id="script"
                  rows={5}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Enter your script for the AI avatar..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={generateVideo}
                  disabled={!script.trim() || isGenerating || !selectedAvatar || !selectedVoice}
                  className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                    !script.trim() || isGenerating || !selectedAvatar || !selectedVoice
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⚡</span>
                      Generating...
                    </>
                  ) : (
                    'Generate Video'
                  )}
                </button>
              </div>
            </div>

            {videoId && <GenerationProgress videoId={videoId} onComplete={handleVideoComplete} />}

            {videoUrl && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Generated Video</h2>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4 text-center">
                  <a
                    href={videoUrl}
                    download
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Video
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
