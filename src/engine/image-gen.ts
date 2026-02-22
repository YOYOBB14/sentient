import Replicate from "replicate";

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

/** Placeholder when Replicate is not configured or request fails. */
function placeholderImage(seed: string, size = 800): string {
  return `https://picsum.photos/seed/${seed}/${size}`;
}

let _replicate: Replicate | null = null;
function getReplicate(): Replicate | null {
  if (!process.env.REPLICATE_API_TOKEN?.trim()) return null;
  if (!_replicate) _replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  return _replicate;
}

/**
 * Generate an image using Flux Schnell on Replicate.
 * Returns placeholder if Replicate is not configured or on failure.
 */
export async function generateImage(prompt: string): Promise<string | null> {
  const replicate = getReplicate();
  if (!replicate) return placeholderImage(simpleHash(prompt || "placeholder"));

  try {
    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90,
      },
    });
    const urls = output as string[];
    return urls[0] || placeholderImage(simpleHash(prompt));
  } catch (error) {
    console.error("[ImageGen] Failed to generate image:", error);
    return placeholderImage(simpleHash(prompt));
  }
}

/**
 * Generate an avatar for a newly created agent.
 * Returns placeholder if Replicate is not configured.
 */
export async function generateAvatar(
  agentName: string,
  personality: string
): Promise<string | null> {
  if (!getReplicate()) {
    return placeholderImage(agentName + personality.slice(0, 20), 200);
  }
  const prompt = `Portrait avatar for an AI agent called "${agentName}". Personality: ${personality}. Digital art style, expressive, unique character design, vibrant colors, centered face/figure, suitable as a social media profile picture. Square format.`;
  return generateImage(prompt);
}
