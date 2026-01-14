'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/chat-types';
import { groupMessages, shouldShowDateDivider, formatDateDivider } from '@/lib/chat-utils';
import ChatMessage from './ChatMessage';

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const messageGroups = groupMessages(messages);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-1"
        >
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                        <p className="text-lg font-medium">No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation!</p>
                    </div>
                </div>
            ) : (
                <>
                    {messageGroups.map((group, groupIdx) => (
                        <div key={`group-${groupIdx}`}>
                            {/* Date Divider */}
                            {group.messages[0] &&
                                shouldShowDateDivider(
                                    group.messages[0],
                                    groupIdx > 0 ? messageGroups[groupIdx - 1].messages[0] : undefined
                                ) && (
                                    <div className="flex items-center justify-center my-4">
                                        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                                            {formatDateDivider(group.messages[0].timestamp)}
                                        </div>
                                    </div>
                                )}

                            {/* Messages in Group */}
                            {group.messages.map((message, msgIdx) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    isCurrentUser={message.senderId === currentUserId}
                                    showAvatar={msgIdx === group.messages.length - 1}
                                    isGrouped={msgIdx > 0}
                                />
                            ))}
                        </div>
                    ))}
                </>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
