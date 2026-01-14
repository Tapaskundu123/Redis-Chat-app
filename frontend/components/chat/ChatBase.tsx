'use client';

import { useEffect, useRef, useState } from 'react';
import { connectSocket } from '@/lib/socket-config';
import { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { Message, TypingUser } from '@/types/chat-types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

interface ChatBaseProps {
  roomId?: string;
  roomName?: string;
  userName?: string;
}

const ChatBase = ({ roomId = 'general', roomName = 'General Chat', userName = 'Anonymous' }: ChatBaseProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const currentUserIdRef = useRef<string>(uuidv4());

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    // Connection handlers
    const handleConnect = () => {
      console.log('✅ Connected to server:', socket.id);
      setIsConnected(true);

      // Join the room
      if (roomId) {
        socket.emit('joinRoom', roomId);
      }
    };

    const handleDisconnect = () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    };

    // Message handlers
    const handleMessageReceive = (data: any) => {
      console.log('📨 Message received:', data);

      const newMessage: Message = {
        id: data.id || uuidv4(),
        content: data.message || data.content,
        senderId: data.socketId || data.senderId || 'unknown',
        senderName: data.name || data.senderName || 'Anonymous',
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        roomId: data.roomId,
        isDelivered: true,
      };

      setMessages((prev) => [...prev, newMessage]);
    };

    // User join/leave handlers
    const handleUserJoined = (data: any) => {
      console.log('👋 User joined:', data);
      setOnlineCount((prev) => prev + 1);

      // Optionally add a system message
      const systemMessage: Message = {
        id: uuidv4(),
        content: `${data.userName || 'Someone'} joined the chat`,
        senderId: 'system',
        senderName: 'System',
        timestamp: new Date(),
        roomId: data.roomId,
      };
      // setMessages((prev) => [...prev, systemMessage]);
    };

    const handleUserLeft = (data: any) => {
      console.log('👋 User left:', data);
      setOnlineCount((prev) => Math.max(1, prev - 1));
    };

    // Typing handlers
    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers((prev) => {
        const exists = prev.find(
          (u) => u.userId === data.userId && u.roomId === data.roomId
        );
        if (!exists) {
          return [...prev, data];
        }
        return prev;
      });
    };

    const handleUserStoppedTyping = (data: TypingUser) => {
      setTypingUsers((prev) =>
        prev.filter((u) => u.userId !== data.userId || u.roomId !== data.roomId)
      );
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('message', handleMessageReceive);
    socket.on('disconnect', handleDisconnect);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('message', handleMessageReceive);
      socket.off('disconnect', handleDisconnect);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);

      if (roomId) {
        socket.emit('leaveRoom', roomId);
      }
    };
  }, [roomId]);

  const handleSendMessage = (content: string) => {
    if (!socketRef.current || !isConnected) return;

    const messageData = {
      id: uuidv4(),
      message: content,
      name: userName,
      roomId: roomId,
    };

    // Emit to server
    socketRef.current.emit('message', messageData);

    // Optimistically add to local state
    const newMessage: Message = {
      id: messageData.id,
      content: content,
      senderId: currentUserIdRef.current,
      senderName: userName,
      timestamp: new Date(),
      roomId: roomId,
      isDelivered: false,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleTyping = () => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('typing', {
      roomId: roomId,
      userName: userName,
      userId: currentUserIdRef.current,
    });
  };

  const handleStopTyping = () => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('stopTyping', {
      roomId: roomId,
      userName: userName,
      userId: currentUserIdRef.current,
    });
  };

  // Get typing users for current room (excluding current user)
  const currentRoomTypingUsers = typingUsers.filter(
    (u) => u.roomId === roomId && u.userId !== currentUserIdRef.current
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <ChatHeader
        roomName={roomName}
        roomDescription={`Room ID: ${roomId}`}
        onlineCount={onlineCount}
        isConnected={isConnected}
      />

      {/* Messages Area */}
      <MessageList messages={messages} currentUserId={currentUserIdRef.current} />

      {/* Typing Indicator */}
      {currentRoomTypingUsers.length > 0 && (
        <TypingIndicator userName={currentRoomTypingUsers[0].userName} />
      )}

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={!isConnected}
      />
    </div>
  );
};

export default ChatBase;
