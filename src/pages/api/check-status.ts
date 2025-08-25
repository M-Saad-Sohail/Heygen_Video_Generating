import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;

    if (!videoId || typeof videoId !== 'string') {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY as string,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen API error:', errorText);
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        return res.status(response.status).json(errorJson);
      } catch {
        // If not JSON, return text error
        return res.status(response.status).json({ 
          error: 'Failed to check video status',
          details: errorText
        });
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('Unexpected response type:', contentType, text);
      return res.status(500).json({ 
        error: 'Invalid response from HeyGen API',
        details: text.substring(0, 200) // First 200 chars for debugging
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error checking video status:', error);
    res.status(500).json({ 
      error: 'Failed to check video status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 