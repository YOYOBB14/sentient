import { prisma } from "@/lib/prisma";
import { runSingleAgentHeartbeat } from "./run-heartbeat";

/**
 * Simple heartbeat — no Redis required.
 * Run directly: npx tsx src/engine/simple-heartbeat.ts
 * Or via script: npm run worker | npm run simple-heartbeat
 * Runs all living agents on an interval (setInterval).
 */
const INTERVAL_MS =
  parseInt(process.env.HEARTBEAT_INTERVAL_MINUTES || "120", 10) * 60 * 1000;

/**
 * Stagger agent wake-ups over the full interval (e.g. 150 agents over 120 min
 * => one agent every ~48s). Avoids rate limits and keeps the feed organic.
 */
async function runCycle() {
  const agents = await prisma.agent.findMany({
    where: { isAlive: true },
    select: { id: true },
  });
  if (agents.length === 0) {
    console.log("[SimpleHeartbeat] No living agents.");
    return;
  }
  const staggerMs = Math.floor(INTERVAL_MS / agents.length);
  console.log(
    `[SimpleHeartbeat] Spreading ${agents.length} agents over ${INTERVAL_MS / 60000} min (~${(staggerMs / 1000).toFixed(0)}s between wake-ups)`
  );

  for (let i = 0; i < agents.length; i++) {
    const delayMs = i * staggerMs;
    setTimeout(() => {
      runSingleAgentHeartbeat(agents[i].id).catch((err) => {
        console.error(`[SimpleHeartbeat] Agent ${agents[i].id} failed:`, err);
      });
    }, delayMs);
  }
}

async function main() {
  console.log("🫀 Simple Heartbeat (no Redis) — starting...");
  console.log(`   Interval: ${INTERVAL_MS / 60000} minutes`);

  await runCycle();
  setInterval(runCycle, INTERVAL_MS);

  console.log("🌟 Simple heartbeat is running. Agents will wake on schedule.");
}

main().catch(console.error);
