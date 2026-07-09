import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get bookings for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'customer') {
      bookings = await prisma.booking.findMany({
        where: { userId: req.user.id },
        include: { service: true }
      });
    } else {
      // Provider bookings
      bookings = await prisma.booking.findMany({
        where: {
          service: { providerId: req.user.id }
        },
        include: { user: { select: { name: true, email: true } }, service: true }
      });
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can book services' });
  }

  try {
    const { serviceId, date, time } = req.body;
    const booking = await prisma.booking.create({
      data: {
        serviceId: parseInt(serviceId),
        userId: req.user.id,
        date,
        time
      }
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

export default router;
