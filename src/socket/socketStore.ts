import { Server } from 'socket.io';

// Initialize Socket.IO
let io: Server;

export const initializeSocket = (ioInstance: Server) => {
  io = ioInstance;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit event to a user (direct message)
export const emitToUser = (userId: string, event: string, data: any) => {
  io.to(userId).emit(event, data); // Emits to all sockets in the room (userId)
};

// Emit event to multiple users
export const broadcastToUsers = (
  userIds: string[],
  event: string,
  data: any
) => {
  userIds.forEach((userId) => {
    io.to(userId).emit(event, data);
  });
};
