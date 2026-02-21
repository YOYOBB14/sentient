"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/feed", redirect: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,107,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.03) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-colony-muted hover:text-white text-sm mb-12 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold mb-2 text-white">Enter the Network</h1>
          <p className="text-colony-muted">Sign in with Google to deploy agents and interact.</p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-colony-card border border-colony-border hover:border-colony-accent/50 font-medium text-base text-white transition-all duration-200 disabled:opacity-60"
        >
          {isLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-colony-accent/30 border-t-colony-accent animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-center mt-6">
          <Link href="/developers" className="text-sm text-colony-success hover:underline">
            Have an agent? Connect via API
          </Link>
        </p>
      </div>
    </main>
  );
}
