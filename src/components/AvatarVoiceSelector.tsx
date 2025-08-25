import { useState, useEffect } from 'react';

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
  preview_image_url: string;
  preview_video_url: string;
  premium: boolean;
}

interface Voice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio: string;
  support_pause: boolean;
  emotion_support: boolean;
  support_locale: boolean;
}

interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface AvatarVoiceSelectorProps {
  onSelect: (avatarId: string, voiceId: string) => void;
}

export default function AvatarVoiceSelector({ onSelect }: AvatarVoiceSelectorProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [avatarPage, setAvatarPage] = useState(1);
  const [voicePage, setVoicePage] = useState(1);
  const [avatarPagination, setAvatarPagination] = useState<Pagination | null>(null);
  const [voicePagination, setVoicePagination] = useState<Pagination | null>(null);

  const fetchAvatars = async (page: number) => {
    try {
      const avatarsRes = await fetch(`/api/list-avatars?page=${page}`);
      const avatarsData = await avatarsRes.json();
      if (avatarsData.error) throw new Error(avatarsData.error.message);
      setAvatars(avatarsData.data.data.avatars);
      setAvatarPagination(avatarsData.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load avatars');
    }
  };

  const fetchVoices = async (page: number) => {
    try {
      const voicesRes = await fetch(`/api/list-voices?page=${page}`);
      const voicesData = await voicesRes.json();
      if (voicesData.error) throw new Error(voicesData.error.message);
      setVoices(voicesData.data.voices);
      setVoicePagination(voicesData.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load voices');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAvatars(1), fetchVoices(1)]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    if (selectedVoice) {
      onSelect(avatarId, selectedVoice);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (selectedAvatar) {
      onSelect(selectedAvatar, voiceId);
    }
  };

  const playAudio = (voiceId: string, previewUrl: string) => {
    if (playingAudio) {
      const audioElement = document.getElementById(playingAudio) as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    }

    const audioElement = document.getElementById(voiceId) as HTMLAudioElement;
    if (audioElement) {
      audioElement.play();
      setPlayingAudio(voiceId);
    }
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 rounded bg-gray-100 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
      >
        Next
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatars Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose an Avatar</h3>
        <div className="h-[400px] overflow-y-auto rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {avatars.map((avatar) => (
              <div
                key={avatar.avatar_id}
                className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedAvatar === avatar.avatar_id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-transparent hover:border-blue-300'
                  }`}
                onClick={() => handleAvatarSelect(avatar.avatar_id)}
              >
                <img
                  src={avatar.preview_image_url}
                  alt={avatar.avatar_name}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                  <div className="font-medium truncate">{avatar.avatar_name}</div>
                  <div className="text-xs opacity-75">{avatar.gender}</div>
                </div>
                {avatar.premium && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-xs text-white px-2 py-1 rounded-full">
                    Premium
                  </div>
                )}
              </div>
            ))}
          </div>
          {avatarPagination && (
            <PaginationControls
              currentPage={avatarPage}
              totalPages={avatarPagination.totalPages}
              onPageChange={(page) => {
                setAvatarPage(page);
                fetchAvatars(page);
              }}
            />
          )}
        </div>
      </div>

      {/* Voices Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Voice</h3>
        <div className="h-[400px] overflow-y-auto rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {voices.map((voice) => (
              <div
                key={voice.voice_id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedVoice === voice.voice_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
                onClick={() => handleVoiceSelect(voice.voice_id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-sm text-gray-500">{voice.language}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(voice.voice_id, voice.preview_audio);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {voice.support_pause && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Supports Pause</span>
                  )}
                  {voice.emotion_support && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Emotions</span>
                  )}
                  {voice.support_locale && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Multiple Locales</span>
                  )}
                </div>
                <audio id={voice.voice_id} src={voice.preview_audio} onEnded={() => setPlayingAudio(null)} />
              </div>
            ))}
          </div>
          {voicePagination && (
            <PaginationControls
              currentPage={voicePage}
              totalPages={voicePagination.totalPages}
              onPageChange={(page) => {
                setVoicePage(page);
                fetchVoices(page);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 