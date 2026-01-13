'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createChatSchema, createChatSchemaType } from "@/schemas/groupChatValidation";
import { toast } from "sonner";
import axios from "axios";
import { useSession } from "next-auth/react";


interface receivedChatData {
  title: string,
  passcode: string,
  user_id: number // ✅ correct
}
const CreateChat = () => {
  const form = useForm<createChatSchemaType>({
    resolver: zodResolver(createChatSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const sessionInfo = useSession();
  const session = sessionInfo?.data;
  const status = sessionInfo?.status;

  // Debug: Log session state on change
  React.useEffect(() => {
    console.log("🔄 useSession Update:", {
      status,
      hasSession: !!session,
      hasUser: !!(session as any)?.user,
      hasToken: !!(session as any)?.user?.token,
    });
  }, [session, status]);

  const onSubmit = async (data: createChatSchemaType) => {
    // Wait for session to load
    if (status === "loading") {
      toast.error("Session is loading. Please try again.");
      return;
    }

    // Check if user is authenticated
    if (status === "unauthenticated") {
      toast.error("You need to be logged in to create a chat group.");
      return;
    }

    const token = (session as any)?.user?.token;
    
    // Debug logging
    console.log("=== CREATE CHAT DEBUG ===");
    console.log("Session Status:", status);
    console.log("Full Session:", session);
    console.log("Session User:", (session as any)?.user);
    console.log("Token Found:", token);
    console.log("========================");

    if (!token) {
      console.error("❌ No token found in session. Session user object:", (session as any)?.user);
      toast.error("Session expired or invalid. Please logout and login again.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chat-group",
        {
          title: data.title,
          passcode: data.passcode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.data) {
        toast.success("Chat group created successfully!");
        reset();
      }
    } catch (error: any) {
      toast.error("Something went wrong", {
        description: error?.response?.data?.message || error.message,
      });
    }
  };

  return (
    <Dialog>
      {/* ✅ This is the recommended way */}
      <DialogTrigger asChild>
        <Button variant="outline">Create Group</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create your new chat</DialogTitle>
          <DialogDescription>
            Enter group title and passcode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter Title"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              {...register("passcode")}
              placeholder="Passcode"
            />
            {errors.passcode && (
              <p className="text-sm text-red-500 mt-1">
                {errors.passcode.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChat;