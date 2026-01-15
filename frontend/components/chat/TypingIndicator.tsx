import React from 'react';

interface TypingIndicatorProps {
    text?: string;
    userName?: string;
}

export default function TypingIndicator({ text, userName }: TypingIndicatorProps) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 fade-in">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
            </div>
            {(text || userName) && (
                <span className="text-sm text-muted-foreground">
                    {text || `${userName} is typing...`}
                </span>
            )}
        </div>
    );
}
