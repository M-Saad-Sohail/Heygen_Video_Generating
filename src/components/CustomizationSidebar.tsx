import { useState } from 'react';

interface CustomizationSidebarProps {
  onBackgroundChange: (background: {
    type: 'color' | 'image' | 'video';
    value?: string;
    url?: string;
    play_style?: 'fit_to_scene' | 'freeze' | 'loop' | 'once';
    fit?: 'cover' | 'crop' | 'contain' | 'none';
  }) => void;
}

export default function CustomizationSidebar({ onBackgroundChange }: CustomizationSidebarProps) {
  const [backgroundType, setBackgroundType] = useState<'color' | 'image' | 'video'>('color');
  const [colorValue, setColorValue] = useState('#FAFAFA');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [playStyle, setPlayStyle] = useState<'fit_to_scene' | 'freeze' | 'loop' | 'once'>('loop');
  const [fit, setFit] = useState<'cover' | 'crop' | 'contain' | 'none'>('cover');

  const handleBackgroundChange = () => {
    switch (backgroundType) {
      case 'color':
        onBackgroundChange({ type: 'color', value: colorValue });
        break;
      case 'image':
        onBackgroundChange({ type: 'image', url: imageUrl, fit });
        break;
      case 'video':
        onBackgroundChange({ type: 'video', url: videoUrl, play_style: playStyle, fit });
        break;
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Customization Options</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Type
          </label>
          <select
            value={backgroundType}
            onChange={(e) => setBackgroundType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="color">Color</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {backgroundType === 'color' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="w-full h-10 p-1 rounded-md border border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use #008000 for green screen effect
            </p>
          </div>
        )}

        {backgroundType === 'image' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fit Style
              </label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="cover">Cover</option>
                <option value="crop">Crop</option>
                <option value="contain">Contain</option>
                <option value="none">None</option>
              </select>
            </div>
          </>
        )}

        {backgroundType === 'video' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter video URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Play Style
              </label>
              <select
                value={playStyle}
                onChange={(e) => setPlayStyle(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="fit_to_scene">Fit to Scene</option>
                <option value="freeze">Freeze</option>
                <option value="loop">Loop</option>
                <option value="once">Once</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fit Style
              </label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="cover">Cover</option>
                <option value="crop">Crop</option>
                <option value="contain">Contain</option>
                <option value="none">None</option>
              </select>
            </div>
          </>
        )}

        <button
          onClick={handleBackgroundChange}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Apply Background
        </button>
      </div>
    </div>
  );
} 