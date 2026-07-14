import express from 'express';

const router = express.Router();

// Proxy for Nominatim search (to avoid client-side CORS/rate limit issues directly)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query is required' });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
      {
        headers: {
          'User-Agent': 'LocalServiceFinder/1.0',
        }
      }
    );
    
    if (!response.ok) throw new Error('Nominatim API error');
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

// Proxy for Nominatim reverse geocoding
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Lat and lon are required' });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'User-Agent': 'LocalServiceFinder/1.0',
        }
      }
    );
    
    if (!response.ok) throw new Error('Nominatim API error');
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ error: 'Failed to fetch reverse geocode data' });
  }
});

export default router;
