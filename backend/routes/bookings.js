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
        include: { 
          service: {
            include: { provider: { select: { name: true, phone: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Provider bookings
      bookings = await prisma.booking.findMany({
        where: {
          service: { providerId: req.user.id }
        },
        include: { 
          user: { select: { name: true, email: true, phone: true } }, 
          service: { select: { title: true, price: true } } 
        },
        orderBy: { createdAt: 'desc' }
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
    const { serviceId, date, time, address, latitude, longitude, notes } = req.body;
    const booking = await prisma.booking.create({
      data: {
        serviceId: serviceId,
        userId: req.user.id,
        date,
        time,
        address,
        latitude,
        longitude,
        notes
      }
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status (Provider mainly, or Customer to cancel)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body; // 'Confirmed', 'Completed', 'Cancelled'
    const bookingId = req.params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Permissions check
    if (req.user.role === 'customer' && status !== 'Cancelled') {
      return res.status(403).json({ error: 'Customers can only cancel bookings' });
    }
    if (req.user.role === 'provider' && booking.service.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized for this booking' });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

export default router;
