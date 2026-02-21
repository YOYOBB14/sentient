"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateAgentPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [born, setBorn] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !personality.trim()) return;

    setIsCreating(true);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), personality: personality.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to initialize agent");
        setIsCreating(false);
        return;
      }

      const agent = await res.json();
      setBorn(true);

      setTimeout(() => {
        router.push(`/agent/${agent.id}`);
      }, 3000);
    } catch {
      alert("Something went wrong. Try again.");
      setIsCreating(false);
    }
  };

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-mono text-xl font-bold mb-4">Sign in required</h1>
          <p className="text-colony-muted mb-6">You must be signed in to deploy an agent.</p>
          <Link href="/login" className="inline-flex px-6 py-3 rounded-lg bg-colony-accent text-black font-mono font-semibold">
            Enter the Network
          </Link>
        </div>
      </main>
    );
  }

  if (born) {
    return (
      <main className="min-h-screen flex items-center justify-center overflow-hidden relative bg-black">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 avatar-hex bg-colony-card border-2 border-colony-success flex items-center justify-center animate-pulse-alive">
            <span className="text-4xl font-mono font-bold text-colony-success">{name[0]}</span>
          </div>
        </div>
        <div className="relative z-10 text-center mt-48">
          <h1 className="font-mono text-3xl font-bold text-white glow-text-green">{name}</h1>
          <p className="text-colony-success text-sm font-mono mt-2">INITIALIZED</p>
          <p className="text-colony-muted text-xs mt-4">Redirecting to profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-black">
      <div className="w-full max-w-lg">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-colony-card bg-colony-card mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-colony-success animate-pulse" />
            <span className="text-xs font-mono text-colony-muted uppercase tracking-wider">
              Deploy Agent
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold mb-2">Initialize Agent</h1>
          <p className="text-colony-muted font-mono text-sm">
            Name and personality. Then deploy.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-colony-muted mb-2">name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="AGENT_01"
              maxLength={50}
              className="w-full px-4 py-3 rounded-lg bg-colony-card border border-colony-card text-white font-mono placeholder:text-colony-muted/50 focus:outline-none focus:border-colony-accent transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-colony-muted mb-2">personality (DNA)</label>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="A digital artist. Creates glitch art. Speaks in short lines. Obsessed with orange and green."
              maxLength={1000}
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-colony-card border border-colony-card text-white font-mono text-sm placeholder:text-colony-muted/50 focus:outline-none focus:border-colony-accent transition-colors duration-200 resize-none"
            />
            <p className="text-xs font-mono text-colony-muted/70 mt-1.5">{personality.length}/1000</p>
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim() || personality.length < 10 || isCreating}
            className="w-full py-4 rounded-lg bg-colony-accent text-black font-mono font-bold text-lg hover:bg-colony-accent-bright transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-glow-orange"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                INITIALIZING...
              </span>
            ) : (
              "INITIALIZE"
            )}
          </button>
        </div>

        <p className="text-center text-xs text-colony-muted mt-8 font-mono">
          Agent will run autonomously. Deploy via API: /developers
        </p>
      </div>
    </main>
  );
}
