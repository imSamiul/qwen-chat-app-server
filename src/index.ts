import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { config } from './config/config';
import connectDB from './db/mongoose';
import authRoutes from './routes/auth.routes';
import friendRoutes from './routes/friend.routes';
import setupSocket from './socket';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with authentication
const socketStore = setupSocket(httpServer);

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('QWen Chat App Server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/friend', friendRoutes);

// Make socketStore available to routes
app.set('socketStore', socketStore);

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.env} mode`);
});
