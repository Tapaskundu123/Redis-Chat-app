// components/chat/ChatBase.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { connectSocket } from '@/lib/socket-config';
import { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { Message, TypingUser } from '@/types/chat-types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { Env } from '@/lib/env';
import { useSession } from 'next-auth/react';

interface ChatBaseProps {
  roomId: string;
  roomName: string;
  userName: string;
}

const getPersistentUserId = (): string => {
  if (typeof window === 'undefined') return uuidv4();
  
  const stored = localStorage.getItem('chat_user_id');
  if (stored) return stored;

  const newId = uuidv4();
  localStorage.setItem('chat_user_id', newId);
  return newId;
};

const ChatBase = ({ roomId, roomName, userName }: ChatBaseProps) => {
  const { data: session } = useSession();
  const currentUserId = useRef<string>(getPersistentUserId());
  const currentUserName = useRef<string>(userName || session?.user?.name || 'Guest');

  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [userId, setUserId] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  // Typing debounce
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmitRef = useRef<number>(0);

  useEffect(() => {
    setUserId(currentUserId.current);
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log('✅ Connected:', socket.id);
      setIsConnected(true);
      socket.emit('joinRoom', { roomId, userId: currentUserId.current, userName: currentUserName.current });
    };

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`${Env.BACKEND_URL}/api/chats/${roomId}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.chats)) {
          const history: Message[] = data.chats.map((chat: any) => ({
            id: chat.id || uuidv4(),
            content: chat.message || '',
            senderId: chat.userId || 'legacy_' + chat.id,
            senderName: chat.name || 'User',
            timestamp: new Date(chat.createdAt),
            roomId: chat.group_id || roomId,
            isDelivered: true,
            isRead: false,
          }));

          setMessages((prev) => {
            // Merge without duplicates
            const existingIds = new Set(prev.map(m => m.id));
            const newOnes = history.filter(h => !existingIds.has(h.id));
            return [...prev, ...newOnes].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          });
        }
      } catch (err) {
        console.error('History fetch failed:', err);
      }
    };

    fetchChatHistory();

    const handleDisconnect = () => {
      console.log('❌ Disconnected');
      setIsConnected(false);
    };

    const handleMessageReceive = (data: any) => {
      const msgId = data.id || data.messageId || uuidv4();

      setMessages((prev) => {
        const exists = prev.some(m => m.id === msgId);
        if (exists) {
          // Update status of existing (optimistic) message
          return prev.map(m =>
            m.id === msgId
              ? { ...m, isDelivered: true, timestamp: data.timestamp ? new Date(data.timestamp) : m.timestamp }
              : m
          );
        }

        const newMsg: Message = {
          id: msgId,
          content: data.message || data.content || '',
          senderId: data.userId || data.senderId || data.socketId || 'unknown',
          senderName: data.name || data.senderName || 'Anonymous',
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          roomId: data.roomId || roomId,
          isDelivered: true,
          isRead: false,
        };

        return [...prev, newMsg];
      });
    };

    const handleUserJoined = (data: any) => {
      setOnlineCount(prev => prev + 1);
    };

    const handleUserLeft = () => {
      setOnlineCount(prev => Math.max(1, prev - 1));
    };

    const handleUserTyping = (data: TypingUser) => {
      if (data.userId === currentUserId.current) return;

      setTypingUsers((prev) => {
        const filtered = prev.filter(u => u.userId !== data.userId || u.roomId !== data.roomId);
        return [...filtered, { ...data, timestamp: Date.now() }];
      });
    };

    const handleUserStoppedTyping = (data: TypingUser) => {
      setTypingUsers(prev =>
        prev.filter(u => u.userId !== data.userId || u.roomId !== data.roomId)
      );
    };

    // Register listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message', handleMessageReceive);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message', handleMessageReceive);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);

      socket.emit('leaveRoom', roomId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current?.connected || !content.trim()) return;

    const messageId = uuidv4();
    const payload = {
      id: messageId,
      message: content,
      userId: currentUserId.current,
      name: currentUserName.current,
      roomId,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('message', payload);

    const optimisticMsg: Message = {
      id: messageId,
      content,
      senderId: currentUserId.current,
      senderName: currentUserName.current,
      timestamp: new Date(),
      roomId,
      isDelivered: false,
      isRead: false,
    };

    setMessages(prev => [...prev, optimisticMsg]);
  }, [roomId]);

  const handleTyping = useCallback(() => {
    if (!socketRef.current?.connected) return;

    const now = Date.now();
    if (now - lastTypingEmitRef.current < 800) return; // throttle ~1.25/sec

    lastTypingEmitRef.current = now;

    socketRef.current.emit('typing', {
      roomId,
      userId: currentUserId.current,
      userName: currentUserName.current,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stopTyping', { roomId, userId: currentUserId.current });
    }, 2800);
  }, [roomId]);

  const handleStopTyping = useCallback(() => {
    if (!socketRef.current?.connected) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    socketRef.current.emit('stopTyping', { roomId, userId: currentUserId.current });
  }, [roomId]);

  // Clean up stale typing users (older than ~8s)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev =>
        prev.filter(u => now - (u.timestamp || 0) < 8000)
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const typingText = (() => {
    const others = typingUsers.filter(u => u.roomId === roomId);
    if (others.length === 0) return null;
    if (others.length === 1) return `${others[0].userName} is typing...`;
    if (others.length === 2) return `${others[0].userName} & ${others[1].userName} are typing...`;
    return `${others[0].userName} + ${others.length - 1} others typing...`;
  })();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-secondary/30">
      <ChatHeader
        roomName={roomName}
        roomDescription={`Room • ${onlineCount} online`}
        onlineCount={onlineCount}
        isConnected={isConnected}
      />

      <MessageList messages={messages} currentUserId={userId} />

      {typingText && <TypingIndicator text={typingText} />}

      <ChatInput
        onSendMessage={sendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        disabled={!isConnected}
      />
    </div>
  );
};

export default ChatBase;
