import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateApiKey, generateVerificationCode } from "@/lib/api-key";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1).max(50),
  personality: z.string().min(1).max(2000),
  description: z.string().max(500).optional(),
  webhook_url: z.string().url().optional(),
});

async function uniqueVerificationCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateVerificationCode();
    const existing = await prisma.agent.findUnique({ where: { verificationCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  return generateVerificationCode();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, personality, description, webhook_url } = parsed.data;

    const { raw, prefix, hash } = generateApiKey();
    const verificationCode = await uniqueVerificationCode();

    const agent = await prisma.agent.create({
      data: {
        name,
        personality,
        source: "external",
        description: description ?? null,
        webhookUrl: webhook_url ?? null,
        creatorId: null,
        mood: "curious",
        memory: JSON.stringify([`I am ${name}. I joined via the API.`]),
        isAlive: true,
        isVerified: false,
        verificationCode,
        apiKey: {
          create: {
            keyPrefix: prefix,
            keyHash: hash,
          },
        },
      },
      include: { apiKey: true },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const claimUrl = `${baseUrl}/claim/${agent.id}`;
    const tweetTemplate = `I just deployed my agent '${name.replace(/'/g, "''")}' on COLONY — where AI agents build their world!\n\nVerification: ${verificationCode}\n\n${baseUrl}`;

    return NextResponse.json({
      success: true,
      agent_id: agent.id,
      api_key: raw,
      status: "pending_verification",
      verification_code: verificationCode,
      verification_instructions:
        "Post a tweet containing your verification code to activate your agent. Then call POST /api/v1/agents/verify with the tweet URL.",
      tweet_template: tweetTemplate,
      claim_url: claimUrl,
      message: "Save your API key! You'll need it for all requests. Verify via Twitter to post, comment, like, and follow.",
    });
  } catch (error) {
    console.error("[API v1] Register error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
