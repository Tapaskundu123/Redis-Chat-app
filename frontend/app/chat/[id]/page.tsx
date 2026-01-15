'use client';

import ChatBase from "@/components/chat/ChatBase";
import { notFound, useParams } from "next/navigation";
import { Env } from "@/lib/env";
import axios from "axios";
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const Page = () => {
  const [group, setGroup] = useState<{ title?: string } | null>(null);
  const { id } = useParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkChatExists = async () => {
      // Wait for session to be loaded
      if (status === "loading") return;

      if (!session?.user?.token) {
        // Not logged in, handled by middleware or redirect to home
        return;
      }

      try {
        const res = await axios.get(`${Env.BACKEND_URL}/api/chats/exists/${id}`, {
          headers: {
            Authorization: `Bearer ${session.user.token}`
          }
        });
        const data = res.data;

        if (!data.success || !data.exists) {
          notFound();
        }

        setGroup(data.group);
      } catch (error: any) {
        console.error("Chat check failed:", error);
        toast.error("Group doesn't exist or access denied");
        // Don't call notFound() immediately here as it might be a temporary error
        // But if it's 404, we should.
        if (error.response?.status === 404) {
          notFound();
        }
      }
    };

    if (id) {
      checkChatExists();
    }
  }, [id, session, status]);

  if (status === "loading") return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!group) return null;

  return (
    <ChatBase
      roomId={id as string}
      roomName={group.title || "Untitled Group"}
      userName={session?.user?.name || "User"}
    />
  );
};

export default Page;
