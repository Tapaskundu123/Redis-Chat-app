'use client';

import { useEffect, useRef, useState } from 'react';
import { connectSocket } from '@/lib/socket-config';
import { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const ChatBase = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const handleMessage = () => {
    if (socketRef.current) {
      socketRef.current.emit('message', { id: uuidv4(), message: 'Your message here' });
    }
  };

  useEffect(() => {
    // Remove any existing listeners first
    const socket = connectSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log('Connected to server:', socket.id);
      setIsConnected(true);
    };

    const handleMessageReceive = (data: any) => {
      console.log('Message received:', data);
      setMessages((prev) => [...prev, data]);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('message', handleMessageReceive);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('message', handleMessageReceive);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <div>
      <h1>Chat App</h1>
      <p>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      <button className='bg-black text-white p-4  rounded-xl' onClick={handleMessage} disabled={!isConnected}>
        Send Message
      </button>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>
              {msg.name}: {msg.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatBase;