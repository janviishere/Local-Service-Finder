import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import categoryRoutes from './routes/categories.js';
import locationRoutes from './routes/location.js';
import favoritesRoutes from './routes/favorites.js';
import chatRoutes from './routes/chat.js';
import prisma from './prismaClient.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ─── Socket.io Setup ───────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  // Join a room for a specific booking
  socket.on('join_booking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
  });

  // Handle a new chat message
  socket.on('send_message', async (data) => {
    // data: { bookingId, senderId, receiverId, message, senderName, senderRole }
    try {
      const msg = await prisma.chatMessage.create({
        data: {
          message: data.message,
          bookingId: data.bookingId,
          senderId: data.senderId,
          receiverId: data.receiverId,
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true, role: true } },
        },
      });
      // Broadcast to everyone in the booking room
      io.to(`booking_${data.bookingId}`).emit('new_message', msg);
    } catch (err) {
      console.error('Socket message error:', err);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  socket.on('leave_booking', (bookingId) => {
    socket.leave(`booking_${bookingId}`);
  });
});

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready`);
});
