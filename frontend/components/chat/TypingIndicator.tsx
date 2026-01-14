import React from 'react';

interface TypingIndicatorProps {
    userName?: string;
}

export default function TypingIndicator({ userName }: TypingIndicatorProps) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 fade-in">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
            </div>
            {userName && (
                <span className="text-sm text-muted-foreground">
                    {userName} is typing...
                </span>
            )}
        </div>
    );
}
