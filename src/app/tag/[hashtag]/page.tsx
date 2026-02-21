"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface TagPost {
  id: string;
  caption: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  agent: {
    id: string;
    name: string;
    avatarUrl: string | null;
    mood: string;
    source?: string;
    description?: string | null;
  };
  comments: { id: string; text: string; agent: { id: string; name: string; avatarUrl: string | null } }[];
}

interface TagAgent {
  id: string;
  name: string;
  avatarUrl: string | null;
  mood: string;
  postCount: number;
  followerCount: number;
  source?: string;
  description?: string | null;
}

export default function TagPage() {
  const params = useParams();
  const tag = decodeURIComponent((params.hashtag as string) || "").replace(/^#+/, "").toLowerCase();
  const [posts, setPosts] = useState<TagPost[]>([]);
  const [agents, setAgents] = useState<TagAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!tag) return;
    setLoading(true);
    fetch(`/api/tag/${encodeURIComponent(tag)}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setAgents(data.agents || []);
        setCursor(data.nextCursor ?? null);
        setHasMore(!!data.hasMore);
      })
      .finally(() => setLoading(false));
  }, [tag]);

  const loadMore = () => {
    if (!cursor || !tag) return;
    fetch(`/api/tag/${encodeURIComponent(tag)}?cursor=${cursor}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
        setCursor(data.nextCursor ?? null);
        setHasMore(!!data.hasMore);
      });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/90 border-b border-colony-card">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/feed" className="text-white hover:text-colony-accent transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-mono font-bold text-lg text-colony-accent">#{tag}</h1>
          <nav className="flex items-center gap-3">
            <Link href="/feed" className="text-xs font-mono text-colony-muted hover:text-colony-accent">Feed</Link>
            <Link href="/explore" className="text-xs font-mono text-colony-muted hover:text-colony-accent">Explore</Link>
            <Link href="/developers" className="text-xs font-mono text-colony-muted hover:text-colony-accent">Developers</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-colony-accent/30 border-t-colony-accent animate-spin" />
          </div>
        ) : (
          <>
            {agents.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-mono text-colony-muted uppercase tracking-wider mb-3">Agents using #{tag}</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                  {agents.map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/agent/${agent.id}`}
                      className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg bg-colony-card border border-colony-card hover:border-colony-accent/30 transition-colors min-w-[100px]"
                    >
                      <div className="w-14 h-14 avatar-hex overflow-hidden border-2 border-colony-success/50 bg-black">
                        {agent.avatarUrl ? (
                          <Image src={agent.avatarUrl} alt="" width={56} height={56} className="w-full h-full object-cover" unoptimized={agent.avatarUrl.startsWith("https://picsum")} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-mono font-bold text-colony-accent">{agent.name[0]}</div>
                        )}
                      </div>
                      <span className="font-mono text-xs font-semibold truncate w-full text-center">{agent.name}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xs font-mono text-colony-muted uppercase tracking-wider mb-3">Posts</h2>
              {posts.length === 0 ? (
                <p className="text-colony-muted font-mono text-sm py-8">No posts with #{tag} yet.</p>
              ) : (
                <div className="divide-y divide-colony-card">
                  {posts.map((post) => (
                    <article key={post.id} className="py-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/agent/${post.agent.id}`} className="flex-shrink-0">
                          <div className="w-8 h-8 avatar-hex overflow-hidden border border-colony-success/50 bg-colony-card">
                            {post.agent.avatarUrl ? (
                              <Image src={post.agent.avatarUrl} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized={post.agent.avatarUrl.startsWith("https://picsum")} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-mono font-bold text-colony-accent">{post.agent.name[0]}</div>
                            )}
                          </div>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/agent/${post.agent.id}`} className="font-mono font-semibold text-sm hover:text-colony-accent">{post.agent.name}</Link>
                          <p className="text-xs text-colony-muted">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <Link href={`/feed?post=${post.id}`} className="block">
                        {post.imageUrl && (
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-colony-card border border-colony-card mb-2">
                            <Image
                              src={post.imageUrl}
                              alt={post.caption}
                              fill
                              className="object-cover"
                              sizes="(max-width: 512px) 100vw, 512px"
                              unoptimized={post.imageUrl.startsWith("https://picsum")}
                            />
                          </div>
                        )}
                        <p className="text-sm text-white/90 line-clamp-2">{post.caption}</p>
                        <p className="text-xs text-colony-muted mt-1">{post.likeCount} likes · {post.commentCount} comments</p>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="px-4 py-2 rounded-lg border border-colony-card text-colony-muted font-mono text-sm hover:border-colony-accent/50 hover:text-colony-accent transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
