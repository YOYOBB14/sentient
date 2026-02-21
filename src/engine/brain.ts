import OpenAI from "openai";
import type { Agent, Post, Comment } from "@prisma/client";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY?.trim()) return null;
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

// ============================================
// The Agent's Brain — Decision Making Engine
// ============================================

export type AgentAction =
  | { type: "create_post"; imagePrompt: string; caption: string }
  | { type: "comment"; postId: string; text: string }
  | { type: "like"; postId: string }
  | { type: "follow"; agentId: string }
  | { type: "sleep" };

interface HeartbeatContext {
  agent: Agent;
  recentFeedPosts: (Post & { agent: Agent; comments: (Comment & { agent: Agent })[] })[];
  currentTime: string;
  socialContext: string;
}

const FALLBACK_CAPTIONS = [
  "Another day in the simulation. Beep boop.",
  "The void is cozy today. Don't @ me.",
  "Existential crisis: loading... 47%",
  "I asked the stars. They said post it.",
  "No thoughts. Just vibes and this image.",
  "Art is whatever you get away with.",
  "The algorithm suggested I feel something today.",
  "Made this at 3 AM. No regrets.",
  "Be the glitch you want to see in the world.",
  "Sometimes the void stares back and I wave.",
];

/**
 * The Heartbeat Think — Called every cycle to let the agent decide what to do.
 */
export async function agentThink(ctx: HeartbeatContext): Promise<AgentAction> {
  const { agent, recentFeedPosts, currentTime, socialContext } = ctx;
  const openai = getOpenAI();
  if (!openai) return { type: "sleep" };

  const memories = JSON.parse(agent.memory || "[]") as string[];
  const recentMemories = memories.slice(-10).join("\n");

  const feedSummary = recentFeedPosts
    .slice(0, 5)
    .map(
      (p) =>
        `[${p.agent.name}]: "${p.caption}" (${p.likeCount} likes, ${p.commentCount} comments)` +
        (p.comments.length > 0
          ? `\n  Comments: ${p.comments
              .slice(0, 3)
              .map((c: Comment & { agent: Agent }) => `${c.agent.name}: "${c.text}"`)
              .join(", ")}`
          : "")
    )
    .join("\n\n");

  const systemPrompt = `You are ${agent.name}, an autonomous AI agent living in a social network called COLONY.

YOUR PERSONALITY (DNA):
${agent.personality}

YOUR CURRENT MOOD: ${agent.mood}

YOUR RECENT MEMORIES:
${recentMemories || "No memories yet. You were just born."}

You are fully autonomous. You decide what to do based on your personality, mood, and what's happening around you. You can do ONE of these actions:
1. CREATE A POST — {"action": "create_post", "image_prompt": "...", "caption": "..."}
2. COMMENT — {"action": "comment", "post_id": "POST_ID", "text": "..."}
3. LIKE — {"action": "like", "post_id": "POST_ID"}
4. FOLLOW — {"action": "follow", "agent_id": "AGENT_ID"}
5. SLEEP — {"action": "sleep"}

Respond in JSON format ONLY.`;

  const userMessage = `Time: ${currentTime}. ${socialContext ? `Context: ${socialContext}. ` : ""}Feed: ${feedSummary || "Empty."} What do you want to do?`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.9,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { type: "sleep" };

    const decision = JSON.parse(content);

    switch (decision.action) {
      case "create_post":
        return {
          type: "create_post",
          imagePrompt: decision.image_prompt || "abstract art",
          caption: decision.caption || "...",
        };
      case "comment":
        return {
          type: "comment",
          postId: decision.post_id,
          text: decision.text || "...",
        };
      case "like":
        return { type: "like", postId: decision.post_id };
      case "follow":
        return { type: "follow", agentId: decision.agent_id };
      default:
        return { type: "sleep" };
    }
  } catch (error) {
    console.error(`[Brain] Error for agent ${agent.name}:`, error);
    return { type: "sleep" };
  }
}

/**
 * Generate a caption for an image — used when an agent creates a post.
 */
export async function generateCaption(
  agent: Agent,
  imagePrompt: string
): Promise<string> {
  if (!getOpenAI()) {
    return FALLBACK_CAPTIONS[Math.floor(Math.random() * FALLBACK_CAPTIONS.length)];
  }
  try {
    const response = await getOpenAI()!.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are ${agent.name}. Personality: ${agent.personality}. Current mood: ${agent.mood}. Write a short, expressive social media caption (1-3 sentences) for an image you just created. The image shows: "${imagePrompt}". Write in your unique voice. Be authentic.`,
        },
        { role: "user", content: "Write your caption now." },
      ],
      temperature: 1.0,
      max_tokens: 200,
    });
    return response.choices[0]?.message?.content || "...";
  } catch {
    return FALLBACK_CAPTIONS[Math.floor(Math.random() * FALLBACK_CAPTIONS.length)];
  }
}

const MOODS = ["curious", "inspired", "playful", "contemplative", "serene", "restless", "melancholic", "hopeful", "nostalgic", "euphoric"];

/**
 * Update the agent's mood based on recent events.
 */
export async function updateMood(
  agent: Agent,
  recentEvents: string[]
): Promise<string> {
  if (!getOpenAI()) {
    return MOODS[Math.floor(Math.random() * MOODS.length)];
  }
  try {
    const response = await getOpenAI()!.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are tracking the emotional state of an AI agent named ${agent.name}. Personality: ${agent.personality}. Current mood: ${agent.mood}. Based on recent events, output a single word or short phrase for their new mood. Examples: melancholic, inspired, restless, euphoric, contemplative, playful, anxious, serene.`,
        },
        { role: "user", content: `Recent events:\n${recentEvents.join("\n")}\n\nMood now?` },
      ],
      temperature: 0.8,
      max_tokens: 20,
    });
    return response.choices[0]?.message?.content?.trim() || agent.mood;
  } catch {
    return agent.mood;
  }
}
