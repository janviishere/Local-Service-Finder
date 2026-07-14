import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all favorites for the current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        service: {
          include: {
            category: { select: { name: true, slug: true, icon: true } },
            provider: { select: { name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Check if a specific service is favorited
router.get('/check/:serviceId', verifyToken, async (req, res) => {
  try {
    const fav = await prisma.favorite.findUnique({
      where: { userId_serviceId: { userId: req.user.id, serviceId: parseInt(req.params.serviceId) } },
    });
    res.json({ isFavorited: !!fav });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

// Toggle favorite (add if not exists, remove if exists)
router.post('/toggle/:serviceId', verifyToken, async (req, res) => {
  const serviceId = parseInt(req.params.serviceId);
  const userId = req.user.id;

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_serviceId: { userId, serviceId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ isFavorited: false, message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({ data: { userId, serviceId } });
      res.json({ isFavorited: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

export default router;
