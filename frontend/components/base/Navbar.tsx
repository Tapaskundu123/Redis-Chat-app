"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import LoginModel from "../auth/LoginModel";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clean up any data attributes added by browser extensions
    if (typeof document !== 'undefined') {
      document.querySelectorAll('[fdprocessedid]').forEach(el => {
        el.removeAttribute('fdprocessedid');
      });
    }
  }, []);

  // Prevent rendering until hydration is complete
  if (!mounted) {
    return (
      <nav className="p-6 flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-xl md:text-2xl font-extrabold">QuickChat</h1>
        <div className="flex items-center space-x-2 md:space-x-6 text-gray-700">
          <Link href="/">Home</Link>
          <Link href="#features">Features</Link>
          <LoginModel />
        </div>
      </nav>
    );
  }

  return (
    <nav className="p-6 flex justify-between items-center bg-white shadow-sm">
      <h1 className="text-xl md:text-2xl font-extrabold">QuickChat</h1>
      <div className="flex items-center space-x-2 md:space-x-6 text-gray-700">
        <Link href="/">Home</Link>
        <Link href="#features">Features</Link>
        {!session?.user ? <LoginModel /> : (
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>)}
      </div>
    </nav>
  );
}