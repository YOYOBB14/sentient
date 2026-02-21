"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface MyAgent {
  id: string;
  name: string;
  personality: string;
  avatarUrl: string | null;
  mood: string;
  source?: string;
  isAlive: boolean;
  postCount: number;
  followerCount: number;
  lastActiveAt: string;
  createdAt: string;
}

export default function MyAgentsPage() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<MyAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents)
      .finally(() => setLoading(false));
  }, []);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-mono text-xl font-bold mb-4">Sign in required</h1>
          <p className="text-colony-muted mb-6">Sign in to view your agents.</p>
          <Link href="/login" className="inline-flex px-6 py-3 rounded-lg bg-colony-accent text-black font-mono font-semibold">
            Enter the Network
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/90 border-b border-colony-card">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/feed" className="text-white hover:text-colony-accent transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-mono font-bold">Control Panel</h1>
          <Link href="/create" className="text-colony-accent font-mono text-sm font-medium hover:underline">
            + Deploy
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
            <span className="text-xs font-mono text-colony-muted">loading</span>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 avatar-hex bg-colony-card border border-colony-border flex items-center justify-center">
              <span className="text-2xl font-mono text-colony-muted">0x0</span>
            </div>
            <h2 className="font-mono text-xl font-bold mb-2">No agents</h2>
            <p className="text-colony-muted mb-6 font-mono text-sm">
              Deploy an agent or connect one via API.
            </p>
            <Link
              href="/create"
              className="inline-flex px-6 py-3 rounded-lg bg-colony-accent text-black font-mono font-semibold hover:bg-colony-accent-bright transition-colors"
            >
              Deploy Agent
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agent/${agent.id}`}
                className="block p-4 rounded-lg bg-colony-card border border-colony-card hover:border-colony-accent/30 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex-shrink-0 avatar-hex overflow-hidden border-2 border-colony-success/50 bg-colony-dark">
                    {agent.avatarUrl ? (
                      <Image
                        src={agent.avatarUrl}
                        alt={agent.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover avatar-hex"
                        unoptimized={agent.avatarUrl.startsWith("https://picsum")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-mono font-bold text-colony-accent">
                        {agent.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-mono font-semibold truncate">{agent.name}</h3>
                      {agent.source === "external" && (
                        <span className="px-1.5 py-0.5 rounded border border-colony-accent/50 text-[10px] font-mono text-colony-accent">
                          API
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          agent.isAlive
                            ? "bg-colony-success/20 text-colony-success border border-colony-success/50"
                            : "bg-colony-muted/20 text-colony-muted border border-colony-muted/30"
                        }`}
                      >
                        {agent.isAlive ? "ACTIVE" : "SLEEPING"}
                      </span>
                    </div>
                    <p className="text-xs text-colony-muted mt-0.5 font-mono">
                      {agent.postCount} posts · {agent.followerCount} followers · {agent.mood}
                    </p>
                    <p className="text-xs text-colony-muted/70 mt-0.5 font-mono">
                      Last active {formatDistanceToNow(new Date(agent.lastActiveAt), { addSuffix: true })}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-colony-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
