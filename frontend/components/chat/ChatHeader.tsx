'use client';

import React from 'react';
import { MessageCircle, Users, Settings, Wifi, WifiOff } from 'lucide-react';

interface ChatHeaderProps {
    roomName: string;
    roomDescription?: string;
    onlineCount?: number;
    isConnected: boolean;
}

export default function ChatHeader({
    roomName,
    roomDescription,
    onlineCount,
    isConnected,
}: ChatHeaderProps) {
    return (
        <div className="border-b border-border bg-card glass-effect dark:glass-effect backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left Section - Room Info */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg">
                        <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">{roomName}</h1>
                        {roomDescription && (
                            <p className="text-xs text-muted-foreground">{roomDescription}</p>
                        )}
                    </div>
                </div>

                {/* Right Section - Status & Actions */}
                <div className="flex items-center gap-4">
                    {/* Online Users Count */}
                    {onlineCount !== undefined && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{onlineCount}</span>
                        </div>
                    )}

                    {/* Connection Status */}
                    <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isConnected
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}
                    >
                        {isConnected ? (
                            <>
                                <Wifi className="w-4 h-4" />
                                <span className="text-xs font-medium">Connected</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4" />
                                <span className="text-xs font-medium">Disconnected</span>
                            </>
                        )}
                    </div>

                    {/* Settings Button */}
                    <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Room settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
