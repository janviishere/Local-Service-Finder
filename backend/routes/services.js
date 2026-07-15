import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all services (with filtering)
router.get('/', async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, minRating, search } = req.query;
    
    let whereClause = { isActive: true };
    
    if (category) {
      whereClause.category = { slug: category };
    }
    if (city) {
      whereClause.city = { contains: city };
    }
    if (minRating) {
      whereClause.rating = { gte: parseFloat(minRating) };
    }
    
    let services = await prisma.service.findMany({
      where: whereClause,
      include: {
        provider: { select: { id: true, name: true, email: true, avatar: true, city: true } },
        category: { select: { name: true, slug: true, icon: true } }
      },
      orderBy: { rating: 'desc' }
    });

    // Fallback: If specific city not found, return all active services
    if (services.length === 0 && city) {
      delete whereClause.city;
      services = await prisma.service.findMany({
        where: whereClause,
        include: {
          provider: { select: { id: true, name: true, email: true, avatar: true, city: true } },
          category: { select: { name: true, slug: true, icon: true } }
        },
        orderBy: { rating: 'desc' }
      });
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      services = services.filter(s => 
        s.title.toLowerCase().includes(lowerSearch) || 
        (s.description && s.description.toLowerCase().includes(lowerSearch))
      );
    }

    // Client-side price filter (price is a string like "₹299")
    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      services = services.filter(s => {
        const numericPrice = parseInt(s.price.replace(/[^\d]/g, ''));
        return numericPrice >= min && numericPrice <= max;
      });
    }

    res.json(services);
  } catch (error) {
    console.error('Services fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});



// Get provider's own services
router.get('/my-services', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Only providers can access their services' });
  }
  try {
    const services = await prisma.service.findMany({
      where: { providerId: req.user.id },
      include: { category: true }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get a single service
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        provider: { select: { name: true, email: true, avatar: true } },
        category: true,
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create a new service (Providers only)
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Only providers can create services' });
  }

  try {
    const { title, description, price, categoryId, duration, city } = req.body;
    const service = await prisma.service.create({
      data: {
        title,
        description,
        price,
        categoryId: categoryId ? parseInt(categoryId) : null,
        duration,
        city,
        providerId: req.user.id
      }
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update a service (Provider only)
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Forbidden' });
  
  try {
    // Check ownership
    const service = await prisma.service.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!service || service.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this service' });
    }

    const { title, description, price, categoryId, duration, city, isActive } = req.body;
    const updated = await prisma.service.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, price, categoryId: categoryId ? parseInt(categoryId) : null, duration, city, isActive }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete a service
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Forbidden' });
  
  try {
    const service = await prisma.service.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!service || service.providerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
