import type { NextApiRequest, NextApiResponse } from 'next';

const ITEMS_PER_PAGE = 9;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const response = await fetch('https://api.heygen.com/v2/voices', {
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY || '',
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API responded with status ${response.status}`);
    }

    const voices = data.data.voices || [];
    const totalItems = voices.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedVoices = voices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return res.status(200).json({
      data: {
        voices: paginatedVoices,
        pagination: {
          page,
          totalPages,
          totalItems,
          itemsPerPage: ITEMS_PER_PAGE
        }
      },
    });
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch voices',
      },
    });
  }
} 