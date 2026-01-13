import DashNav from "@/components/chatGroup/DashNav";
import React from "react";
import { authOptions, CustomSession } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import CreateChat from "@/components/chatGroup/createChat";
import FetchGroups from "@/components/chatGroup/FetchGroups";

export default async function dashboard() {
  const session: CustomSession | null = await getServerSession(authOptions);
  const token = (session as any)?.user?.token;

  return (
    <div>
      <DashNav
        name={session?.user?.name ?? "Guest"}
        image={session?.user?.image ?? undefined}
      />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mt-6 mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Dashboard
          </h1>
          <CreateChat />
        </div>

        {/* Groups List */}
        <div className="mt-4">
          <FetchGroups token={token} />
        </div>
      </div>
    </div>
  );
}