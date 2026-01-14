import React from 'react';
import { getInitials, getAvatarGradientClass } from '@/lib/chat-utils';

interface UserAvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    isOnline?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
};

const statusSizeClasses = {
    sm: 'w-2 h-2 bottom-0 right-0',
    md: 'w-2.5 h-2.5 bottom-0 right-0',
    lg: 'w-3 h-3 bottom-0.5 right-0.5',
};

export default function UserAvatar({ name, size = 'md', isOnline, className = '' }: UserAvatarProps) {
    const gradientClass = getAvatarGradientClass(name);
    const initials = getInitials(name);

    return (
        <div className={`relative inline-block ${className}`}>
            <div
                className={`${sizeClasses[size]} ${gradientClass} rounded-full flex items-center justify-center text-white font-semibold shadow-md`}
            >
                {initials}
            </div>
            {isOnline !== undefined && (
                <div
                    className={`absolute ${statusSizeClasses[size]} rounded-full border-2 border-background ${isOnline ? 'status-online' : 'status-offline'
                        }`}
                />
            )}
        </div>
    );
}
