import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Haversine distance helper (km) ──────────────────────────────────────────
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── GET /api/providers/profile — own provider profile ───────────────────────
router.get('/profile', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Providers only' });
  }
  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { name: true, email: true, phone: true, city: true, avatar: true } } },
    });
    // Parse JSON fields
    if (profile) {
      profile.certifications = profile.certifications ? JSON.parse(profile.certifications) : [];
      profile.documents = profile.documents ? JSON.parse(profile.documents) : [];
      profile.availabilitySlots = profile.availabilitySlots
        ? JSON.parse(profile.availabilitySlots)
        : {};
    }
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch provider profile' });
  }
});

// ─── GET /api/providers/:id — public provider profile ────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: parseInt(req.params.id) },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, phone: true, city: true, avatar: true,
            services: {
              where: { isActive: true },
              include: { category: true },
              orderBy: { rating: 'desc' },
            },
          },
        },
      },
    });
    if (!profile) return res.status(404).json({ error: 'Provider not found' });

    // Parse JSON fields
    profile.certifications = profile.certifications ? JSON.parse(profile.certifications) : [];
    profile.documents = profile.documents ? JSON.parse(profile.documents) : [];
    profile.availabilitySlots = profile.availabilitySlots
      ? JSON.parse(profile.availabilitySlots)
      : {};

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// ─── POST /api/providers/onboarding — submit onboarding form ─────────────────
router.post('/onboarding', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Providers only' });
  }
  try {
    const {
      tagline, bio, yearsOfExperience, certifications, documents,
      serviceRadius, availabilitySlots, serviceArea, serviceLatitude,
      serviceLongitude, phone, city,
    } = req.body;

    // Upsert provider profile (create or update)
    const profile = await prisma.providerProfile.upsert({
      where: { userId: req.user.id },
      update: {
        tagline, bio,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        certifications: certifications ? JSON.stringify(certifications) : null,
        documents: documents ? JSON.stringify(documents) : null,
        serviceRadius: serviceRadius ? parseFloat(serviceRadius) : null,
        availabilitySlots: availabilitySlots ? JSON.stringify(availabilitySlots) : null,
        serviceArea,
        serviceLatitude: serviceLatitude ? parseFloat(serviceLatitude) : null,
        serviceLongitude: serviceLongitude ? parseFloat(serviceLongitude) : null,
        verificationStatus: 'approved',
      },
      create: {
        userId: req.user.id,
        tagline, bio,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        certifications: certifications ? JSON.stringify(certifications) : null,
        documents: documents ? JSON.stringify(documents) : null,
        serviceRadius: serviceRadius ? parseFloat(serviceRadius) : null,
        availabilitySlots: availabilitySlots ? JSON.stringify(availabilitySlots) : null,
        serviceArea,
        serviceLatitude: serviceLatitude ? parseFloat(serviceLatitude) : null,
        serviceLongitude: serviceLongitude ? parseFloat(serviceLongitude) : null,
        verificationStatus: 'approved',
      },
    });

    // Also update user's phone and city if provided
    if (phone || city) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { phone: phone || undefined, city: city || undefined },
      });
    }

    res.json({ message: 'Onboarding complete', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// ─── PUT /api/providers/profile — update provider profile ────────────────────
router.put('/profile', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Providers only' });
  }
  try {
    const {
      tagline, bio, yearsOfExperience, certifications, documents,
      serviceRadius, subscriptionPlan, isAvailable,
      serviceArea, serviceLatitude, serviceLongitude,
    } = req.body;

    const profile = await prisma.providerProfile.update({
      where: { userId: req.user.id },
      data: {
        tagline, bio,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
        certifications: certifications !== undefined ? JSON.stringify(certifications) : undefined,
        documents: documents !== undefined ? JSON.stringify(documents) : undefined,
        serviceRadius: serviceRadius ? parseFloat(serviceRadius) : undefined,
        subscriptionPlan,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
        serviceArea,
        serviceLatitude: serviceLatitude ? parseFloat(serviceLatitude) : undefined,
        serviceLongitude: serviceLongitude ? parseFloat(serviceLongitude) : undefined,
      },
    });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update provider profile' });
  }
});

// ─── PUT /api/providers/availability — update availability slots ──────────────
router.put('/availability', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Providers only' });
  }
  try {
    const { availabilitySlots, isAvailable } = req.body;
    const profile = await prisma.providerProfile.update({
      where: { userId: req.user.id },
      data: {
        availabilitySlots: availabilitySlots ? JSON.stringify(availabilitySlots) : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      },
    });
    res.json({ message: 'Availability updated', isAvailable: profile.isAvailable });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// ─── GET /api/providers/earnings — provider earnings summary ─────────────────
router.get('/earnings', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Providers only' });
  }
  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      select: { totalEarnings: true, completedJobs: true },
    });

    // Get completed bookings with payment info
    const bookings = await prisma.booking.findMany({
      where: {
        service: { providerId: req.user.id },
        status: 'Completed',
      },
      include: {
        payment: true,
        service: { select: { title: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Build weekly earnings array (last 7 days)
    const now = new Date();
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayBookings = bookings.filter((b) => {
        const bd = new Date(b.createdAt);
        return bd.toDateString() === d.toDateString();
      });
      const earnings = dayBookings.reduce((sum, b) => {
        const price = parseFloat((b.totalPrice || '0').replace(/[^0-9.]/g, ''));
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
      return { label, earnings };
    });

    res.json({
      totalEarnings: profile?.totalEarnings || 0,
      completedJobs: profile?.completedJobs || 0,
      recentPayments: bookings.slice(0, 10).map((b) => ({
        id: b.id,
        service: b.service?.title,
        amount: b.totalPrice,
        date: b.createdAt,
        paymentStatus: b.payment?.status || 'unpaid',
      })),
      weeklyData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// ─── GET /api/providers/nearby — radius-based provider search ────────────────
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 20, category } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    let whereClause = { isActive: true };
    if (category) whereClause.category = { slug: category };

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true, name: true, city: true, avatar: true,
            providerProfile: {
              select: {
                serviceLatitude: true, serviceLongitude: true,
                serviceRadius: true, isAvailable: true,
                subscriptionPlan: true, verificationStatus: true,
                rating: false,
              },
            },
          },
        },
        category: { select: { name: true, slug: true, icon: true } },
      },
    });

    // Filter by distance
    const nearby = services
      .map((s) => {
        const pp = s.provider?.providerProfile;
        const pLat = pp?.serviceLatitude || s.latitude;
        const pLng = pp?.serviceLongitude || s.longitude;
        if (!pLat || !pLng) return { ...s, distance: null };
        const dist = haversineDistance(parseFloat(lat), parseFloat(lng), pLat, pLng);
        return { ...s, distance: parseFloat(dist.toFixed(1)) };
      })
      .filter((s) => s.distance === null || s.distance <= parseFloat(radius))
      .sort((a, b) => {
        // Sort: available first, then by distance
        if (a.provider?.providerProfile?.isAvailable !== b.provider?.providerProfile?.isAvailable) {
          return a.provider?.providerProfile?.isAvailable ? -1 : 1;
        }
        return (a.distance || 999) - (b.distance || 999);
      });

    res.json(nearby);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch nearby providers' });
  }
});

export default router;
