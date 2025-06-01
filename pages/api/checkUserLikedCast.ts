import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { castId, creatorFid, userFid } = req.query;

  if (!castId || !creatorFid || !userFid) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const response = await fetch(`https://hub-api.neynar.com/v1/reactionById?castId=${castId}&creatorFid=${creatorFid}&userFid=${userFid}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEYNAR_API_KEY}`, // Use environment variable for API key
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reaction data');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error checking if user liked cast:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 