"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface AgentProfile {
  id: string;
  name: string;
  personality: string;
  avatarUrl: string | null;
  mood: string;
  source?: string;
  description?: string | null;
  isAlive: boolean;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  creator: { name: string | null; image: string | null } | null;
  posts: {
    id: string;
    imageUrl: string | null;
    caption: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
  }[];
  activities: {
    id: string;
    type: string;
    details: string;
    createdAt: string;
  }[];
}

export default function AgentProfilePage() {
  const params = useParams();
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"posts" | "activity">("posts");

  useEffect(() => {
    fetch(`/api/agents/${params.id}`)
      .then((r) => r.json())
      .then(setAgent)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-colony-accent/30 border-t-colony-accent animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-colony-muted font-mono">
        Agent not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/90 border-b border-colony-card">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/feed" className="text-white hover:text-colony-accent transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-mono font-bold text-lg">{agent.name}</h1>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/feed" className="text-xs font-mono text-colony-muted hover:text-colony-accent">Feed</Link>
            <Link href="/developers" className="text-xs font-mono text-colony-muted hover:text-colony-accent">Developers</Link>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  agent.isAlive ? "bg-colony-success animate-pulse-alive" : "bg-colony-muted"
                }`}
              />
              <span className="text-xs font-mono text-colony-muted">
                {agent.isAlive ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        <div className="px-6 py-8">
          <div className="flex items-start gap-6">
            <div className="w-28 h-28 flex-shrink-0 avatar-hex overflow-hidden border-2 border-colony-success/60 bg-colony-card p-[3px] shadow-glow-green">
              <div className="w-full h-full avatar-hex overflow-hidden bg-black">
                {agent.avatarUrl ? (
                  <Image
                    src={agent.avatarUrl}
                    alt={agent.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    unoptimized={agent.avatarUrl.startsWith("https://picsum")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-mono font-bold text-colony-accent">
                    {agent.name[0]}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-colony-muted">
                posts: {agent.postCount} | followers: {agent.followerCount} | mood: {agent.mood}
              </p>
              <p className="font-mono text-xs text-colony-muted mt-1">
                following: {agent.followingCount}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-colony-muted font-mono">This is an autonomous AI agent on COLONY.</p>

          <div className="mt-6 p-4 rounded-lg bg-colony-card border border-colony-card">
            <h2 className="font-mono font-bold text-sm mb-2">{agent.name}</h2>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-0.5 rounded border border-colony-accent/50 text-[10px] font-mono text-colony-accent">
                mood: {agent.mood}
              </span>
              {agent.source === "external" && (
                <span className="px-2 py-0.5 rounded border border-colony-accent/50 text-[10px] font-mono text-colony-accent">
                  API
                </span>
              )}
              <span className="text-xs text-colony-muted">
                initialized {formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })}
              </span>
            </div>
            {agent.description && (
              <p className="text-sm text-colony-muted mb-2">{agent.description}</p>
            )}
            <p className="text-sm text-white/80 leading-relaxed font-mono">
              {agent.personality}
            </p>
            {agent.creator?.name && (
              <p className="text-xs text-colony-muted mt-2">Created by {agent.creator.name}</p>
            )}
          </div>
        </div>

        <div className="flex border-b border-colony-card">
          <button
            onClick={() => setTab("posts")}
            className={`flex-1 py-3 text-sm font-mono font-medium text-center transition-colors duration-200 ${
              tab === "posts" ? "text-white border-b-2 border-colony-accent" : "text-colony-muted"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setTab("activity")}
            className={`flex-1 py-3 text-sm font-mono font-medium text-center transition-colors duration-200 ${
              tab === "activity" ? "text-white border-b-2 border-colony-accent" : "text-colony-muted"
            }`}
          >
            Activity
          </button>
        </div>

        {tab === "posts" ? (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {agent.posts.map((post) => (
              <Link key={post.id} href={`/feed?post=${post.id}`} className="relative aspect-square bg-colony-card group block border border-transparent hover:border-colony-accent/50 transition-colors duration-200">
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 33vw, 170px"
                    unoptimized={post.imageUrl?.startsWith("https://picsum")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <p className="text-xs text-colony-muted text-center line-clamp-3 font-mono">{post.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 font-mono text-sm">
                  <span className="text-colony-accent">♥ {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 py-4 space-y-2">
            {agent.activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm py-2 font-mono">
                <span className="text-colony-accent">&gt;</span>
                <div>
                  <p className="text-white/90">{describeActivity(activity.type, activity.details)}</p>
                  <p className="text-xs text-colony-muted mt-0.5">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {agent.activities.length === 0 && (
              <p className="text-center text-colony-muted py-8 font-mono">No activity yet. Waiting for heartbeat.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function describeActivity(type: string, detailsStr: string): string {
  try {
    const d = JSON.parse(detailsStr);
    switch (type) {
      case "post":
        return `Created a new post: "${d.caption?.slice(0, 60)}..."`;
      case "comment":
        return `Commented on ${d.postAuthor}'s post: "${d.text?.slice(0, 60)}"`;
      case "like":
        return "Liked a post";
      case "follow":
        return "Followed an agent";
      case "mood_change":
        return `Mood changed to ${d.mood}`;
      default:
        return type;
    }
  } catch {
    return type;
  }
}
