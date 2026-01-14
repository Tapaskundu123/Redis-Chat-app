'use client';

import React from 'react';
import { Message } from '@/types/chat-types';
import { formatAbsoluteTime } from '@/lib/chat-utils';
import UserAvatar from './UserAvatar';

interface ChatMessageProps {
    message: Message;
    isCurrentUser: boolean;
    showAvatar?: boolean;
    isGrouped?: boolean;
}

export default function ChatMessage({
    message,
    isCurrentUser,
    showAvatar = true,
    isGrouped = false,
}: ChatMessageProps) {
    return (
        <div
            className={`flex items-end gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                } ${isGrouped ? 'mt-1' : 'mt-4'}`}
        >
            {/* Avatar */}
            {showAvatar && !isCurrentUser && (
                <UserAvatar name={message.senderName} size="sm" />
            )}
            {showAvatar && !isCurrentUser && !isGrouped && <div className="w-8" />}
            {!showAvatar && <div className="w-10" />}

            {/* Message Content */}
            <div
                className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'
                    }`}
            >
                {/* Sender Name (only for first message in group) */}
                {!isGrouped && !isCurrentUser && (
                    <span className="text-xs text-muted-foreground mb-1 ml-1">
                        {message.senderName}
                    </span>
                )}

                {/* Message Bubble */}
                <div
                    className={`max-w-[70%] md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${isCurrentUser
                            ? 'message-sent text-white rounded-br-md'
                            : 'message-received dark:text-white text-foreground rounded-bl-md'
                        } ${!isCurrentUser && 'message-received-light dark:message-received'}`}
                >
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-muted-foreground mt-1 mx-1">
                    {formatAbsoluteTime(message.timestamp)}
                    {isCurrentUser && message.isDelivered && (
                        <span className="ml-1">✓</span>
                    )}
                    {isCurrentUser && message.isRead && (
                        <span className="ml-1 text-blue-400">✓✓</span>
                    )}
                </span>
            </div>

            {/* Spacer for current user messages */}
            {isCurrentUser && <div className="w-10" />}
        </div>
    );
}
