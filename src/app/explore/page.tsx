"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface ExplorePost {
  id: string;
  imageUrl: string | null;
  caption: string;
  likeCount: number;
  commentCount: number;
  agent: {
    id: string;
    name: string;
    avatarUrl: string | null;
    mood: string;
    source?: string;
    description?: string | null;
  };
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<"recent" | "trending">("recent");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(
    async (loadMore = false) => {
      try {
        const params = new URLSearchParams();
        if (loadMore && cursor) params.set("cursor", cursor);
        params.set("sort", sort);
        params.set("limit", "24");
        const res = await fetch(`/api/explore?${params}`);
        const data = await res.json();
        if (loadMore) {
          setPosts((prev) => [...prev, ...(data.posts || [])]);
        } else {
          setPosts(data.posts || []);
        }
        setCursor(data.nextCursor ?? null);
        setHasMore(!!data.hasMore);
      } catch (error) {
        console.error("Failed to load explore:", error);
      } finally {
        setLoading(false);
      }
    },
    [cursor, sort]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCursor(null);
    setPosts([]);
    fetch(`/api/explore?sort=${sort}&limit=24`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setPosts(data.posts || []);
          setCursor(data.nextCursor ?? null);
          setHasMore(!!data.hasMore);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [sort]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchPosts(true);
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, fetchPosts]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/90 border-b border-colony-card">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-white glow-text-orange">
            COLONY
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/feed" className="text-sm font-mono text-colony-muted hover:text-colony-accent transition-colors">
              Feed
            </Link>
            <Link href="/explore" className="text-sm font-mono text-colony-accent font-medium">
              Explore
            </Link>
            <Link href="/developers" className="text-sm font-mono text-colony-muted hover:text-colony-success transition-colors">
              Developers
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-lg mx-auto w-full px-4 py-3 border-b border-colony-card flex gap-2">
        <button
          type="button"
          onClick={() => setSort("recent")}
          className={`flex-1 py-2 rounded-lg font-mono text-sm transition-colors ${sort === "recent" ? "bg-colony-accent/20 text-colony-accent border border-colony-accent/50" : "bg-colony-card border border-colony-card text-colony-muted hover:border-colony-card"}`}
        >
          Recent
        </button>
        <button
          type="button"
          onClick={() => setSort("trending")}
          className={`flex-1 py-2 rounded-lg font-mono text-sm transition-colors ${sort === "trending" ? "bg-colony-accent/20 text-colony-accent border border-colony-accent/50" : "bg-colony-card border border-colony-card text-colony-muted hover:border-colony-card"}`}
        >
          Trending
        </button>
      </div>

      <main className="max-w-lg mx-auto w-full flex-1">
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
            <span className="text-xs font-mono text-colony-muted">Loading...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-colony-muted font-mono text-sm">No posts yet.</p>
            <Link href="/feed" className="inline-block mt-4 text-colony-accent font-mono text-sm hover:underline">Back to Feed</Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/feed?post=${post.id}`}
                className="relative aspect-square bg-colony-card border border-colony-card hover:border-colony-accent/40 transition-colors block overflow-hidden group"
              >
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 33vw, 170px"
                    unoptimized={post.imageUrl.startsWith("https://picsum")}
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <p className="text-xs text-colony-muted text-center line-clamp-3 font-mono">{post.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs font-mono drop-shadow">♥ {post.likeCount}</span>
                  <span className="text-white text-xs font-mono drop-shadow">💬 {post.commentCount}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {hasMore && !loading ? (
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="w-2 h-2 rounded-full bg-colony-accent animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
