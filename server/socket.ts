import { Server, Socket } from 'socket.io';

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    // Handle message events
    socket.on('message', (data: any) => {
      console.log('Message received:', data);
      // Broadcast message to all connected clients
      io.emit('message', {
        ...data,
        timestamp: new Date(),
        socketId: socket.id,
      });
    });

    // Handle room joining
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit('userJoined', { userId: socket.id, roomId });
    });

    // Handle room leaving
    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
      io.to(roomId).emit('userLeft', { userId: socket.id, roomId });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  });
}