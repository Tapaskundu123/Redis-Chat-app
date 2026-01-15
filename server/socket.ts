import { Server, Socket } from 'socket.io';
import prisma from "./src/config/db.config";

export function setupSocket(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('🔌 User connected:', socket.id);

        // Handle message events
        socket.on('message', async (data: any) => {
            console.log('📨 Message received:', data);

            try {
                // Save message to database
                await prisma.chatMessage.create({
                    data: {
                        group_id: data.roomId,
                        name: data.name,
                        message: data.message,
                    },
                });

                const messageData = {
                    ...data,
                    timestamp: new Date(),
                    socketId: socket.id,
                };

                // If roomId is provided, send to room; otherwise broadcast to all
                if (data.roomId) {
                    io.to(data.roomId).emit('message', messageData);
                } else {
                    io.emit('message', messageData);
                }
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        // Handle room joining
        socket.on('joinRoom', (roomId: string) => {
            socket.join(roomId);
            console.log(`👋 User ${socket.id} joined room ${roomId}`);

            // Notify other users in the room
            socket.to(roomId).emit('userJoined', {
                userId: socket.id,
                roomId,
                timestamp: new Date()
            });
        });

        // Handle room leaving
        socket.on('leaveRoom', (roomId: string) => {
            socket.leave(roomId);
            console.log(`👋 User ${socket.id} left room ${roomId}`);

            // Notify other users in the room
            socket.to(roomId).emit('userLeft', {
                userId: socket.id,
                roomId,
                timestamp: new Date()
            });
        });

        // Handle typing event
        socket.on('typing', (data: { roomId: string; userName: string; userId: string }) => {
            console.log(`⌨️ ${data.userName} is typing in room ${data.roomId}`);

            // Broadcast to others in the room
            socket.to(data.roomId).emit('userTyping', {
                userId: data.userId,
                userName: data.userName,
                roomId: data.roomId,
            });
        });

        // Handle stop typing event
        socket.on('stopTyping', (data: { roomId: string; userName: string; userId: string }) => {
            console.log(`⌨️ ${data.userName} stopped typing in room ${data.roomId}`);

            // Broadcast to others in the room
            socket.to(data.roomId).emit('userStoppedTyping', {
                userId: data.userId,
                userName: data.userName,
                roomId: data.roomId,
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('❌ User disconnected:', socket.id);
        });

        // Handle errors
        socket.on('error', (error: any) => {
            console.error('⚠️ Socket error:', error);
        });
    });
}
