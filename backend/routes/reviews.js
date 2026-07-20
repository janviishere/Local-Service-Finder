import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get reviews for a service
router.get('/service/:id', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { serviceId: req.params.id },
      include: {
        user: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a review
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can leave reviews' });
  }

  try {
    const { serviceId, rating, comment } = req.body;
    
    // Check if user has a completed booking for this service
    const completedBooking = await prisma.booking.findFirst({
      where: {
        userId: req.user.id,
        serviceId: serviceId,
        status: 'Completed'
      }
    });

    if (!completedBooking) {
      return res.status(400).json({ error: 'You can only review services you have completed.' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        serviceId: serviceId,
        userId: req.user.id,
        rating: parseInt(rating),
        comment
      }
    });

    // Update service average rating
    const aggregations = await prisma.review.aggregate({
      where: { serviceId: serviceId },
      _avg: { rating: true },
      _count: { id: true }
    });

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        rating: aggregations._avg.rating || 0,
        reviewCount: aggregations._count.id
      }
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
