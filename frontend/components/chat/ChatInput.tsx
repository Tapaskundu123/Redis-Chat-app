'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    onTyping?: () => void;
    onStopTyping?: () => void;
    disabled?: boolean;
}

export default function ChatInput({
    onSendMessage,
    onTyping,
    onStopTyping,
    disabled = false,
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }

        // Typing indicator logic
        if (value && !isTyping) {
            setIsTyping(true);
            onTyping?.();
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onStopTyping?.();
        }, 2000);
    };

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled) return;

        onSendMessage(trimmedMessage);
        setMessage('');
        setIsTyping(false);
        onStopTyping?.();

        // Clear timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-border bg-card p-4">
            <div className="flex items-end gap-2">
                {/* Emoji Picker Button */}
                <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Add emoji"
                >
                    <Smile className="w-5 h-5" />
                </button>

                {/* Message Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={disabled}
                        rows={1}
                        className="w-full px-4 py-3 pr-12 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none chat-input-focus resize-none max-h-[120px] overflow-y-auto custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Attachment Button */}
                <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Attach file"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                {/* Send Button */}
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                    aria-label="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground mt-2 ml-2">
                Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to send,{' '}
                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Shift+Enter</kbd> for new line
            </p>
        </div>
    );
}
