import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { linkedAccounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// Summoner/League endpoints use the platform server, not routing region
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

  // Get ranked entries directly by puuid (Riot removed summonerId from summoner responses)
  const entriesRes = await fetch(
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${account.puuid}`,
    { headers: { "X-Riot-Token": apiKey } }
  );
  if (!entriesRes.ok) return Response.json({ error: "Failed to fetch rank" }, { status: 502 });

  const entries: Array<{
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  }> = await entriesRes.json();

  // Return only Solo and Flex entries, sorted Solo first
  const ranked = entries
    .filter((e) => e.queueType === "RANKED_SOLO_5x5" || e.queueType === "RANKED_FLEX_SR")
    .sort((a) => (a.queueType === "RANKED_SOLO_5x5" ? -1 : 1));

  return Response.json(ranked);
}
