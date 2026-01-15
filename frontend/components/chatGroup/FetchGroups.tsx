"use client";
import React, { useEffect, useState } from "react";
import GroupCard from "./GroupCard";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ChatGroup {
    id: string;
    title: string;
    passcode: string;
    createdAt: string;
}

interface FetchGroupsProps {
    token?: string;
}

const FetchGroups: React.FC<FetchGroupsProps> = ({ token: passedToken }) => {
    const { data: session } = useSession();
    const [groups, setGroups] = useState<ChatGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Use passed token or get from session
    const token = passedToken || session?.user?.token;

    useEffect(() => {
        const fetchGroups = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch("http://localhost:5000/api/chat-group", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (data.success) {
                    setGroups(data.groups);
                } else {
                    console.error("Fetch failed:", data.message);
                }
            } catch (error) {
                console.error("Error fetching groups:", error);
                toast.error("Failed to load chat groups");
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="text-center py-10 opacity-70">
                <p className="text-lg">No chat groups found. Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
                <GroupCard
                    key={group.id}
                    id={group.id}
                    title={group.title}
                    passcode={group.passcode}
                    created_at={group.createdAt}
                />
            ))}
        </div>
    );
};

export default FetchGroups;
