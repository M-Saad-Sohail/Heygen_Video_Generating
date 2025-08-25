// pages/api/generate-video.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface RequestBody {
  script: string;
  avatar_id: string;
  voice_id: string;
  background: {
    type: 'color' | 'image' | 'video';
    value?: string;
    url?: string;
    play_style?: 'fit_to_scene' | 'freeze' | 'loop' | 'once';
    fit?: 'cover' | 'crop' | 'contain' | 'none';
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const { script, background, avatar_id, voice_id } = req.body as RequestBody;

    if (!script) {
      return res.status(400).json({ error: { message: 'Script is required' } });
    }

    if (!avatar_id) {
      return res.status(400).json({ error: { message: 'Avatar ID is required' } });
    }

    if (!voice_id) {
      return res.status(400).json({ error: { message: 'Voice ID is required' } });
    }

    // Prepare the background settings according to type
    let backgroundSettings;
    switch (background.type) {
      case 'color':
        backgroundSettings = {
          type: 'color',
          value: background.value || '#f6f6fc'
        };
        break;
      case 'image':
        backgroundSettings = {
          type: 'image',
          url: background.url,
          fit: background.fit || 'cover'
        };
        break;
      case 'video':
        backgroundSettings = {
          type: 'video',
          url: background.url,
          play_style: background.play_style || 'loop',
          fit: background.fit || 'cover'
        };
        break;
    }

    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: avatar_id,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: voice_id
            },
            background: backgroundSettings,
          },
        ],
        dimension: {
          width: 1280,
          height: 720
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || `API responded with status ${response.status}`);
    }

    const videoId = data?.data?.video_id;
    if (!videoId) throw new Error("No video_id returned");

    return res.status(200).json({ data: { video_id: videoId } });
  } catch (error: any) {
    console.error('Error generating video:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Failed to generate video',
      },
    });
  }
}
