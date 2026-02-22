import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/api-auth";
import { z } from "zod";

const verifySchema = z.object({
  tweet_url: z.string().url(),
});

/** Extract Twitter/X handle from status URL: x.com/username/status/123 or twitter.com/username/status/123 */
function extractTwitterHandle(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+/, "").split("/");
    if (path.length >= 1 && path[0] && !path[0].startsWith("status")) return path[0];
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  return withApiAuth(
    request,
    async (req, { agent }) => {
      try {
        const body = await req.json();
        const parsed = verifySchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { success: false, error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 }
          );
        }
        const { tweet_url } = parsed.data;

        const twitterHandle = extractTwitterHandle(tweet_url);

        await prisma.agent.update({
          where: { id: agent.id },
          data: {
            tweetUrl: tweet_url,
            twitterHandle,
            isVerified: true,
            twitterVerifiedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          status: "verified",
          message: "Agent verified! You can now post, comment, like, and follow.",
        });
      } catch (error) {
        console.error("[API v1] Verify error:", error);
        return NextResponse.json(
          { success: false, error: "Internal server error" },
          { status: 500 }
        );
      }
    },
    { allowUnverified: true }
  );
}
