import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { linkedAccounts, rankSnapshots } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";

const PLATFORM: Record<string, string> = {
  NA1: "na1", BR1: "br1", LA1: "la1", LA2: "la2",
  EUW1: "euw1", EUN1: "eun1", TR1: "tr1", RU: "ru",
  KR: "kr", JP1: "jp1",
  OC1: "oc1", PH2: "ph2", SG2: "sg2", TH2: "th2", VN2: "vn2", TW2: "tw2",
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [account] = await db
    .select()
    .from(linkedAccounts)
    .where(and(eq(linkedAccounts.id, Number(id)), eq(linkedAccounts.userId, userId)));

  if (!account) return Response.json({ error: "Account not found" }, { status: 404 });

  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) return Response.json({ error: "Riot API key not configured" }, { status: 500 });

  const platform = PLATFORM[account.region];

  const entriesRes = await fetch(
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${account.puuid}`,
    { headers: { "X-Riot-Token": apiKey } }
  );
  if (!entriesRes.ok) return Response.json({ error: "Failed to fetch rank" }, { status: 502 });

  const entries: Array<{
    queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number;
  }> = await entriesRes.json();

  const ranked = entries
    .filter((e) => e.queueType === "RANKED_SOLO_5x5" || e.queueType === "RANKED_FLEX_SR")
    .sort((a) => (a.queueType === "RANKED_SOLO_5x5" ? -1 : 1));

  // Save a snapshot for each queue (one per day — skip if already saved today)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existingToday = await db
    .select()
    .from(rankSnapshots)
    .where(and(eq(rankSnapshots.accountId, account.id), gte(rankSnapshots.capturedAt, todayStart)));

  const existingQueues = new Set(existingToday.map((s) => s.queueType));

  for (const entry of ranked) {
    if (!existingQueues.has(entry.queueType)) {
      await db.insert(rankSnapshots).values({
        accountId: account.id,
        queueType: entry.queueType,
        tier: entry.tier,
        rank: entry.rank,
        lp: entry.leaguePoints,
      });
    }
  }

  return Response.json(ranked);
}
