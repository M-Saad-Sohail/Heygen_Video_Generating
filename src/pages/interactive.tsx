import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import the InteractiveAvatar component with no SSR
const InteractiveAvatar = dynamic(
  () => import('../components/InteractiveAvatar'),
  { ssr: false }
);

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
}

interface Voice {
  voice_id: string;
  name: string;
}

export default function InteractivePage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [avatarsRes, voicesRes] = await Promise.all([
          fetch('/api/list-avatars?page=1'),
          fetch('/api/list-voices?page=1')
        ]);

        const avatarsData = await avatarsRes.json();
        const voicesData = await voicesRes.json();

        if (avatarsData.error) throw new Error(avatarsData.error.message);
        if (voicesData.error) throw new Error(voicesData.error.message);

        setAvatars(avatarsData.data.avatars);
        setVoices(voicesData.data.voices);
        setLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load avatars and voices';
        setError(message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 p-4 bg-red-50 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Interactive Avatar Demo</h1>

      {!selectedAvatar || !selectedVoice ? (
        <div className="space-y-8">
          {/* Avatar Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select an Avatar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {avatars.map((avatar) => (
                <div
                  key={avatar.avatar_id}
                  onClick={() => setSelectedAvatar(avatar.avatar_id)}
                  className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedAvatar === avatar.avatar_id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-transparent hover:border-blue-300'
                  }`}
                >
                  <div className="w-full aspect-square relative">
                    <Image
                      src={avatar.preview_image_url}
                      alt={avatar.avatar_name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                    <div className="font-medium truncate">{avatar.avatar_name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select a Voice</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {voices.map((voice) => (
                <div
                  key={voice.voice_id}
                  onClick={() => setSelectedVoice(voice.voice_id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedVoice === voice.voice_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium">{voice.name}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedAvatar && selectedVoice && (
            <button
              onClick={() => {
                // Force re-render of InteractiveAvatar
                setSelectedAvatar(null);
                setSelectedVoice(null);
                setTimeout(() => {
                  setSelectedAvatar(selectedAvatar);
                  setSelectedVoice(selectedVoice);
                }, 0);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reset Selection
            </button>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setSelectedAvatar(null);
              setSelectedVoice(null);
            }}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Selection
          </button>
          <InteractiveAvatar
            avatarId={selectedAvatar}
            voiceId={selectedVoice}
          />
        </div>
      )}
    </div>
  );
} 