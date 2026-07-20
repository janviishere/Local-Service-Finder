import express from 'express';
import prisma from '../prismaClient.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import crypto from 'crypto';

const router = express.Router();

// Generate a simple invoice number
function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${month}-${rand}`;
}

// ─── POST /api/payments/initiate — initiate a mock payment ───────────────────
router.post('/initiate', verifyToken, async (req, res) => {
  try {
    const { bookingId, paymentType } = req.body;
    // paymentType: 'deposit' (50%) | 'full' (100%)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, payment: true },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const rawPrice = parseFloat((booking.totalPrice || '0').replace(/[^0-9.]/g, '')) || 0;
    const taxAmount = parseFloat((rawPrice * 0.18).toFixed(2)); // 18% GST
    const totalWithTax = rawPrice + taxAmount;
    const depositAmount = parseFloat((totalWithTax * 0.5).toFixed(2));

    const amountToPay = paymentType === 'deposit' ? depositAmount : totalWithTax;

    // Create or return existing payment record
    let payment = booking.payment;
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          bookingId: bookingId,
          amount: totalWithTax,
          depositAmount,
          taxAmount,
          status: 'pending',
          invoiceNumber: generateInvoiceNumber(),
        },
      });
    }

    res.json({
      paymentId: payment.id,
      invoiceNumber: payment.invoiceNumber,
      amountToPay,
      totalAmount: totalWithTax,
      depositAmount,
      taxAmount,
      rawAmount: rawPrice,
      paymentType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// ─── POST /api/payments/confirm — confirm payment (mock) ─────────────────────
router.post('/confirm', verifyToken, async (req, res) => {
  try {
    const { paymentId, paymentMethod, paymentType, cardDetails } = req.body;
    // cardDetails: { number, name, expiry, cvv } — we just validate format, not real

    // Basic card validation (mock)
    if (paymentMethod === 'card') {
      const num = (cardDetails?.number || '').replace(/\s/g, '');
      if (num.length < 13 || num.length > 19) {
        return res.status(400).json({ error: 'Invalid card number' });
      }
      if (!cardDetails?.name || cardDetails.name.trim().length < 2) {
        return res.status(400).json({ error: 'Invalid card holder name' });
      }
      if (!(cardDetails?.expiry || '').includes('/')) {
        return res.status(400).json({ error: 'Invalid expiry format' });
      }
      if ((cardDetails?.cvv || '').length < 3) {
        return res.status(400).json({ error: 'Invalid CVV' });
      }
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: { include: { service: { include: { provider: { include: { providerProfile: true } } } } } } },
    });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const transactionId = `TXN${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const isDepositOnly = paymentType === 'deposit';

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentMethod,
        transactionId,
        depositPaid: true,
        fullPaid: !isDepositOnly,
        status: isDepositOnly ? 'deposit_paid' : 'completed',
      },
    });

    // Update provider stats if full payment
    if (!isDepositOnly) {
      const providerId = payment.booking.service?.provider?.id;
      if (providerId) {
        const existingProfile = await prisma.providerProfile.findUnique({ where: { userId: providerId } });
        if (existingProfile) {
          const rawEarning = payment.amount - payment.taxAmount; // provider gets amount minus tax
          await prisma.providerProfile.update({
            where: { userId: providerId },
            data: {
              totalEarnings: { increment: rawEarning },
              completedJobs: { increment: 1 },
            },
          });
        }
      }
    }

    res.json({
      success: true,
      transactionId,
      invoiceNumber: payment.invoiceNumber,
      status: updatedPayment.status,
      message: isDepositOnly
        ? 'Deposit paid successfully. Pay the rest after service completion.'
        : 'Payment completed successfully!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment confirmation failed' });
  }
});

// ─── POST /api/payments/complete-remaining — pay remaining after deposit ──────
router.post('/complete-remaining', verifyToken, async (req, res) => {
  try {
    const { paymentId, paymentMethod, cardDetails } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: { include: { service: { include: { provider: true } } } } },
    });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (!payment.depositPaid) return res.status(400).json({ error: 'Deposit not paid yet' });
    if (payment.fullPaid) return res.status(400).json({ error: 'Already fully paid' });

    const remainingAmount = payment.amount - payment.depositAmount;
    const transactionId = `TXN${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    await prisma.payment.update({
      where: { id: paymentId },
      data: { fullPaid: true, status: 'completed', transactionId },
    });

    // Update provider stats
    const providerId = payment.booking.service?.provider?.id;
    if (providerId) {
      const rawEarning = payment.amount - payment.taxAmount;
      await prisma.providerProfile.updateMany({
        where: { userId: providerId },
        data: {
          totalEarnings: { increment: rawEarning },
          completedJobs: { increment: 1 },
        },
      });
    }

    res.json({
      success: true,
      transactionId,
      remainingAmount,
      status: 'completed',
      message: 'Remaining balance paid. Service fully settled!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete payment' });
  }
});

// ─── GET /api/payments/receipt/:bookingId — get invoice/receipt ───────────────
router.get('/receipt/:bookingId', verifyToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.bookingId },
      include: {
        service: {
          include: {
            provider: {
              select: {
                name: true, email: true, phone: true, city: true,
                providerProfile: { select: { tagline: true, subscriptionPlan: true } },
              },
            },
            category: { select: { name: true } },
          },
        },
        user: { select: { name: true, email: true, phone: true, address: true, city: true } },
        payment: true,
      },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id && booking.service?.provider?.id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const rawAmount = parseFloat((booking.totalPrice || '0').replace(/[^0-9.]/g, '')) || 0;
    const taxAmount = booking.payment?.taxAmount || parseFloat((rawAmount * 0.18).toFixed(2));

    res.json({
      invoiceNumber: booking.payment?.invoiceNumber || 'N/A',
      date: booking.createdAt,
      customer: booking.user,
      provider: booking.service?.provider,
      service: {
        title: booking.service?.title,
        category: booking.service?.category?.name,
        duration: booking.service?.duration,
        scheduledDate: booking.date,
        scheduledTime: booking.time,
        address: booking.address,
      },
      pricing: {
        baseAmount: rawAmount,
        taxRate: 18,
        taxAmount,
        totalAmount: rawAmount + taxAmount,
        depositPaid: booking.payment?.depositPaid || false,
        fullPaid: booking.payment?.fullPaid || false,
        status: booking.payment?.status || 'pending',
      },
      transactionId: booking.payment?.transactionId,
      paymentMethod: booking.payment?.paymentMethod,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

export default router;
