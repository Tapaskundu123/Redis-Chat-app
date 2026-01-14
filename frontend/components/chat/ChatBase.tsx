'use client';

import { useEffect, useMemo, useState } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket-config';
import { Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const ChatBase = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const socket: Socket = useMemo(() => {
    return connectSocket();
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setIsConnected(true);
    });

    socket.on('message', (data: any) => {
      console.log('The secret message is ', data);
      setMessages((prev) => [...prev, data]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('disconnect');
      disconnectSocket();
    };
  }, [socket]);

  const handleMessage = () => {
    socket.emit('message', { name: 'Tapas', id: uuidv4(), message: 'secret message' });
  };

  return (
    <div>
      <h1>Chat App</h1>
      <p>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      <button onClick={handleMessage} disabled={!isConnected}>
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