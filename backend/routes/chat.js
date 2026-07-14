import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all messages for a booking
router.get('/:bookingId', verifyToken, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: { select: { providerId: true } } },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const isCustomer = booking.userId === req.user.id;
    const isProvider = booking.service.providerId === req.user.id;
    if (!isCustomer && !isProvider) return res.status(403).json({ error: 'Unauthorized' });

    const messages = await prisma.chatMessage.findMany({
      where: { bookingId },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a new message (REST fallback)
router.post('/:bookingId', verifyToken, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const { message, receiverId } = req.body;

    const msg = await prisma.chatMessage.create({
      data: {
        message,
        bookingId,
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
      },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
    });

    res.status(201).json(msg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
