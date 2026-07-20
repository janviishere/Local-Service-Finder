import express from 'express';
import prisma from '../prismaClient.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get platform stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'customer' } });
    const totalProviders = await prisma.user.count({ where: { role: 'provider' } });
    const totalBookings = await prisma.booking.count();
    
    const payments = await prisma.payment.findMany({
      where: { status: { in: ['completed', 'deposit_paid'] } }
    });
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0) + (p.taxAmount || 0), 0);

    res.json({
      totalUsers,
      totalProviders,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get providers list
router.get('/providers', verifyAdmin, async (req, res) => {
  try {
    const providers = await prisma.user.findMany({
      where: { role: 'provider' },
      include: {
        providerProfile: true,
        services: { select: { id: true, title: true, rating: true, reviewCount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(providers);
  } catch (error) {
    console.error('Admin providers error:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get customers list
router.get('/customers', verifyAdmin, async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'customer' },
      include: {
        _count: {
          select: { bookings: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('Admin customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get all bookings
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        service: { select: { title: true, provider: { select: { name: true } } } },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Admin bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Ban/Delete a user (cascading normally handled by prisma, but we need to ensure it or just delete)
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' });

    // In a real app we might soft delete or ban. For now, delete entirely.
    // Need to delete related provider profile, services, etc if provider
    if (user.role === 'provider') {
      // First delete services and provider profile
      const services = await prisma.service.findMany({ where: { providerId: userId } });
      const serviceIds = services.map(s => s.id);
      
      await prisma.favorite.deleteMany({ where: { serviceId: { in: serviceIds } } });
      await prisma.review.deleteMany({ where: { serviceId: { in: serviceIds } } });
      
      const bookings = await prisma.booking.findMany({ where: { serviceId: { in: serviceIds } } });
      const bookingIds = bookings.map(b => b.id);
      await prisma.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.chatMessage.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.booking.deleteMany({ where: { serviceId: { in: serviceIds } } });
      
      await prisma.service.deleteMany({ where: { providerId: userId } });
      await prisma.providerProfile.deleteMany({ where: { userId } });
    } else {
      // Customer deletions
      const bookings = await prisma.booking.findMany({ where: { userId } });
      const bookingIds = bookings.map(b => b.id);
      await prisma.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.chatMessage.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await prisma.booking.deleteMany({ where: { userId } });
      await prisma.favorite.deleteMany({ where: { userId } });
      await prisma.review.deleteMany({ where: { userId } });
    }

    // Finally delete user
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
