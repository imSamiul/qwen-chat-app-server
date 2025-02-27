import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { socketAuth } from '../middleware/socketAuth';
import { handleUserConnection } from './handlers';
import * as socketStore from './socketStore';

const setupSocket = (httpServer: HttpServer) => {
  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3001',
      credentials: true,
    },
  });

  // Initialize socket store
  socketStore.initializeSocket(io);

  // Apply authentication middleware
  io.use(socketAuth);

  // Handle connections
  io.on('connection', (socket: any) => {
    // Set up connection
    handleUserConnection(socket);
  });

  return socketStore;
};

export default setupSocket;
