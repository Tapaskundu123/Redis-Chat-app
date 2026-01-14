import { Message, MessageGroup } from '@/types/chat-types';

/**
 * Format timestamp to relative time (e.g., "2m ago", "1h ago")
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }

    // Format as date for older messages
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format timestamp to absolute time (e.g., "2:30 PM")
 */
export function formatAbsoluteTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Generate a consistent color index from a string (e.g., username)
 * Returns a number from 1-6 for avatar gradient classes
 */
export function getAvatarGradientClass(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % 6) + 1;
    return `avatar-gradient-${index}`;
}

/**
 * Get initials from a name (max 2 characters)
 */
export function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Group consecutive messages from the same sender
 */
export function groupMessages(messages: Message[]): MessageGroup[] {
    const groups: MessageGroup[] = [];

    messages.forEach((message) => {
        const lastGroup = groups[groups.length - 1];

        if (lastGroup && lastGroup.senderId === message.senderId) {
            lastGroup.messages.push(message);
        } else {
            groups.push({
                senderId: message.senderId,
                senderName: message.senderName,
                messages: [message],
            });
        }
    });

    return groups;
}

/**
 * Check if a date should show a date divider
 */
export function shouldShowDateDivider(
    currentMessage: Message,
    previousMessage?: Message
): boolean {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();

    return currentDate !== previousDate;
}

/**
 * Format date divider text (e.g., "Today", "Yesterday", "Jan 15")
 */
export function formatDateDivider(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
        return 'Today';
    }

    if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
