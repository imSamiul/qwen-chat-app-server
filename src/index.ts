import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config/config';
import connectDB from './db/mongoose';
import authRoutes from './routes/auth.routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, you should configure this more securely
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.send('QWen Chat App Server is running');
});
app.use('/api/auth', authRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.env} mode`);
});
