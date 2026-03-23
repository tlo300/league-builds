import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { linkedAccounts, rankSnapshots } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

const TIER_ORDER = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
const DIVISION_VALUE: Record<string, number> = { IV: 0, III: 1, II: 2, I: 3 };

function toLpTotal(tier: string, rank: string, lp: number): number {
  const tierIdx = TIER_ORDER.indexOf(tier);
  if (tierIdx < 0) return lp;
  if (tierIdx >= 7) return tierIdx * 400 + lp; // Master+ has no divisions
  return tierIdx * 400 + (DIVISION_VALUE[rank] ?? 0) * 100 + lp;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [account] = await db
    .select()
    .from(linkedAccounts)
    .where(and(eq(linkedAccounts.id, Number(id)), eq(linkedAccounts.userId, userId)));

  if (!account) return Response.json({ error: "Account not found" }, { status: 404 });

  const snapshots = await db
    .select()
    .from(rankSnapshots)
    .where(eq(rankSnapshots.accountId, account.id))
    .orderBy(asc(rankSnapshots.capturedAt));

  // Deduplicate to one snapshot per (queueType, date) — keep latest of each day
  const byQueueAndDate = new Map<string, typeof snapshots[0]>();
  for (const snap of snapshots) {
    const date = snap.capturedAt.toISOString().split("T")[0];
    byQueueAndDate.set(`${snap.queueType}|${date}`, snap);
  }

  const deduped = Array.from(byQueueAndDate.values()).sort(
    (a, b) => a.capturedAt.getTime() - b.capturedAt.getTime()
  );

  // Group by queueType and shape for charting
  const grouped: Record<string, Array<{ date: string; lpTotal: number; tier: string; rank: string; lp: number }>> = {};
  for (const snap of deduped) {
    if (!grouped[snap.queueType]) grouped[snap.queueType] = [];
    const date = snap.capturedAt.toISOString().split("T")[0];
    const [, month, day] = date.split("-");
    grouped[snap.queueType].push({
      date: `${month}/${day}`,
      lpTotal: toLpTotal(snap.tier, snap.rank, snap.lp),
      tier: snap.tier,
      rank: snap.rank,
      lp: snap.lp,
    });
  }

  return Response.json(grouped);
}
