import { Types } from 'mongoose';
import { AuthenticatedSocket } from '../middleware/socketAuth';
import UserModel from '../models/user.model';
import * as socketStore from './socketStore';

// Friend request handler
export const handleFriendRequest = (socket: AuthenticatedSocket) => {
  socket.on(
    'sendFriendRequest',
    async (data: { senderId: Types.ObjectId; recipientId: string }) => {
      try {
        const { senderId, recipientId } = data;
        if (socket.user?._id !== senderId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        // Save to database (your logic here)
        console.log(`Friend request from ${senderId} to ${recipientId}`);

        const recipient = await UserModel.findById(recipientId);
        if (!recipient?.friendRequests.includes(senderId)) {
          recipient?.friendRequests.push(senderId);
          await recipient?.save();
        }

        // Emit real-time notification to the recipient
        socketStore.emitToUser(recipientId, 'newFriendRequest', {
          senderId,
          senderName: (await UserModel.findById(senderId))?.username,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error('Error handling friend request:', error);
      }
    }
  );
};

// // Message handler
// export const handleMessage = (socket: AuthenticatedSocket) => {
//   socket.on(
//     'sendMessage',
//     async (data: { recipientId: string; content: string }) => {
//       try {
//         const senderId = socket.user._id;

//         socketStore.emitToUser(data.recipientId, 'newMessage', {
//           senderId,
//           content: data.content,
//           timestamp: new Date(),
//         });
//       } catch (error) {
//         console.error('Error handling message:', error);
//       }
//     }
//   );
// };

// // Typing indicator handlers
// export const handleTyping = (socket: AuthenticatedSocket) => {
//   socket.on('typing', (data: { recipientId: string }) => {
//     socketStore.emitToUser(data.recipientId, 'userTyping', {
//       userId: socket.user._id,
//       username: socket.user.username,
//     });
//   });

//   socket.on('stopTyping', (data: { recipientId: string }) => {
//     socketStore.emitToUser(data.recipientId, 'userStoppedTyping', {
//       userId: socket.user._id,
//     });
//   });
// };

// Handle user connection
// Map to track active users and their socket IDs
const activeUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds
export const handleUserConnection = (socket: AuthenticatedSocket) => {
  // Associate the socket with the user
  const userId = socket.user?._id.toString();
  if (!userId) return;

  // Add the socket to the user's room
  socket.join(userId);

  // Track the socket ID for the user
  if (!activeUsers.has(userId)) {
    activeUsers.set(userId, new Set());
  }
  activeUsers.get(userId)?.add(socket.id);

  console.log(
    `Authenticated user connected: ${userId}, Socket ID: ${socket.id}`
  );

  // Listen for disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
    const userSockets = activeUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        activeUsers.delete(userId);
        console.log(`All sockets for user ${userId} disconnected`);
      }
    }
  });
};
