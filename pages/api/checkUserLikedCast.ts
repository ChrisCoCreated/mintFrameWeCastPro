import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { target_hash, target_fid, fid } = req.query;
  const reaction_type = 'Like'; // Hardcoded reaction type

  if (!target_hash || !target_fid || !fid) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'API key is missing' });
  }

  try {
    const response = await fetch(`https://hub-api.neynar.com/v1/reactionById?reaction_type=${reaction_type}&target_hash=${target_hash}&target_fid=${target_fid}&fid=${fid}`, {
      headers: {
        'x-api-key': apiKey, // Use environment variable for API key
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