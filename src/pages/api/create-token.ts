import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API responded with status ${response.status}`);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error creating streaming token:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Failed to create streaming token',
      },
    });
  }
} 