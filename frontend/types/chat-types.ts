export interface User {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    roomId?: string;
    isRead?: boolean;
    isDelivered?: boolean;
}

export interface Room {
    id: string;
    name: string;
    description?: string;
    users: User[];
    lastMessage?: Message;
    unreadCount?: number;
}

export interface TypingUser {
    userId: string;
    userName: string;
    roomId: string;
}

export interface SocketEvents {
    // Client to Server
    message: (data: { content: string; roomId?: string; senderName: string }) => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    typing: (data: { roomId: string; userName: string }) => void;
    stopTyping: (data: { roomId: string; userName: string }) => void;

    // Server to Client
    messageReceived: (message: Message) => void;
    userJoined: (data: { userId: string; roomId: string; userName?: string }) => void;
    userLeft: (data: { userId: string; roomId: string; userName?: string }) => void;
    userTyping: (data: TypingUser) => void;
    userStoppedTyping: (data: TypingUser) => void;
    connect: () => void;
    disconnect: () => void;
}

export type MessageGroup = {
    senderId: string;
    senderName: string;
    messages: Message[];
};
