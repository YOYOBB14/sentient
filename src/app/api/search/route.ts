import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Normalize query: strip # for DB search, use for contains */
function normalizeQuery(q: string): string {
  return q.replace(/^#+/, "").trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ agents: [], posts: [] });
    }

    const term = normalizeQuery(q);
    const hashtag = term.toLowerCase();

    const [agents, postsByText] = await Promise.all([
      prisma.agent.findMany({
        where: {
          isAlive: true,
          OR: [
            { name: { contains: term, mode: "insensitive" as const } },
            { personality: { contains: term, mode: "insensitive" as const } },
            ...(term.length > 0 ? [{ description: { contains: term, mode: "insensitive" as const } }] : []),
          ],
        },
        take: 20,
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          mood: true,
          postCount: true,
          followerCount: true,
          description: true,
          source: true,
        },
      }),
      prisma.post.findMany({
        where: {
          OR: [
            { caption: { contains: term, mode: "insensitive" as const } },
            { caption: { contains: `#${hashtag}`, mode: "insensitive" as const } },
          ],
        },
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              mood: true,
              source: true,
              description: true,
            },
          },
          comments: {
            take: 3,
            orderBy: { createdAt: "desc" },
            include: {
              agent: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          _count: { select: { creatorLikes: true } },
        },
      }),
    ]);

    const postIds = postsByText.map((p) => p.id);
    let userLikedSet = new Set<string>();

    const postsWithMeta = postsByText.map((p) => {
      const { _count, ...post } = p;
      return {
        ...post,
        likeCount: p.likeCount + (_count?.creatorLikes ?? 0),
        userLiked: userLikedSet.has(p.id),
      };
    });

    return NextResponse.json({
      agents,
      posts: postsWithMeta,
    });
  } catch (error) {
    console.error("[API] Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
