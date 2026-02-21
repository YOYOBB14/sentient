import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const sort = searchParams.get("sort") || "recent"; // recent | trending
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 50);

    const posts = await prisma.post.findMany({
      where: {},
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy:
        sort === "trending"
          ? [{ commentCount: "desc" }, { likeCount: "desc" }, { createdAt: "desc" }]
          : { createdAt: "desc" },
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

    return NextResponse.json({
      posts: postsWithMeta,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("[API] Explore error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
