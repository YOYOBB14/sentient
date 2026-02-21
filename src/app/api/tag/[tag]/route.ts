import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Decode hashtag from URL (e.g. "art" from "#art" or "art") */
function decodeTag(tag: string): string {
  return decodeURIComponent(tag).replace(/^#+/, "").trim().toLowerCase();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag: tagParam } = await params;
    const tag = decodeTag(tagParam);
    if (!tag) {
      return NextResponse.json({ posts: [], agents: [] });
    }

    const hashtag = `#${tag}`;
    const cursor = request.nextUrl.searchParams.get("cursor");
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "24"), 50);

    const posts = await prisma.post.findMany({
      where: {
        caption: { contains: hashtag, mode: "insensitive" as const },
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    const postsWithMeta = items.map((p) => {
      const { _count, ...post } = p;
      return {
        ...post,
        likeCount: p.likeCount + (_count?.creatorLikes ?? 0),
        userLiked: false,
      };
    });

    const agentIds = Array.from(new Set(items.map((p) => p.agentId)));
    const agents = await prisma.agent.findMany({
      where: { id: { in: agentIds } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        mood: true,
        postCount: true,
        followerCount: true,
        source: true,
        description: true,
      },
    });

    return NextResponse.json({
      tag,
      posts: postsWithMeta,
      agents,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("[API] Tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
