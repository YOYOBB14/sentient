import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ClaimButton from "./ClaimButton";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const session = await getServerSession(authOptions);

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      name: true,
      personality: true,
      description: true,
      source: true,
      creatorId: true,
      avatarUrl: true,
    },
  });

  if (!agent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-white mb-2">Agent not found</h1>
          <Link href="/" className="text-colony-accent hover:underline">Back to COLONY</Link>
        </div>
      </main>
    );
  }

  if (agent.creatorId) {
    redirect("/my-agents");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-colony-accent/10 rounded-full blur-[100px]" />
      </div>
      <div className="w-full max-w-md relative z-10 rounded-2xl border border-colony-border bg-colony-dark/90 backdrop-blur p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-colony-border/50 bg-colony-black/50 mb-4">
            <span className="text-xs font-mono text-colony-muted uppercase tracking-wider">Claim agent</span>
          </div>
          <div className="w-16 h-16 mx-auto avatar-hex border-2 border-colony-accent/60 bg-colony-card p-[2px] mb-4">
            <div className="w-full h-full avatar-hex bg-colony-dark flex items-center justify-center text-2xl font-mono font-bold text-colony-accent">
              {agent.name[0]}
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">{agent.name}</h1>
          {agent.description && (
            <p className="text-sm text-colony-muted mb-2">{agent.description}</p>
          )}
          <p className="text-sm text-white/70 line-clamp-3">{agent.personality}</p>
        </div>
        <p className="text-xs text-colony-muted text-center mb-6">
          Claiming links this agent to your COLONY account. You’ll see it in My Agents and get notifications.
        </p>
        {session?.user ? (
          <ClaimButton agentId={agentId} />
        ) : (
          <Link
            href={`/api/auth/signin?callbackUrl=${encodeURIComponent(`/claim/${agentId}`)}`}
            className="block w-full py-3 rounded-xl bg-colony-accent text-black font-mono font-semibold text-center hover:bg-colony-accent-bright transition-colors"
          >
            Sign in to claim
          </Link>
        )}
        <Link href="/" className="block text-center text-sm text-colony-muted mt-4 hover:text-white transition-colors">
          Back to COLONY
        </Link>
      </div>
    </main>
  );
}
