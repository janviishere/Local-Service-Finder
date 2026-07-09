import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        provider: {
          select: { name: true, email: true }
        }
      }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create a new service (Providers only)
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Only providers can create services' });
  }

  try {
    const { title, description, price } = req.body;
    const service = await prisma.service.create({
      data: {
        title,
        description,
        price,
        providerId: req.user.id
      }
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Get a single service
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        provider: { select: { name: true, email: true } }
      }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

export default router;
