import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { linkedAccounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const ROUTING: Record<string, string> = {
  NA1: "americas", BR1: "americas", LA1: "americas", LA2: "americas",
  EUW1: "europe", EUN1: "europe", TR1: "europe", RU: "europe",
  KR: "asia", JP1: "asia",
  OC1: "sea", PH2: "sea", SG2: "sea", TH2: "sea", VN2: "sea", TW2: "sea",
};

const QUEUE_NAMES: Record<number, string> = {
  420: "Ranked Solo", 440: "Ranked Flex", 430: "Normal Blind",
  400: "Normal Draft", 450: "ARAM", 900: "URF", 1020: "One for All",
  1400: "Spellbook", 76: "URF", 83: "Co-op vs AI", 0: "Custom",
};

const POSITION_DISPLAY: Record<string, string> = {
  TOP: "Top", JUNGLE: "Jungle", MIDDLE: "Mid", BOTTOM: "Bot", UTILITY: "Support",
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

  const routing = ROUTING[account.region];

  // Fetch 10 recent match IDs (queue 0 = all queues)
  const idsRes = await fetch(
    `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${account.puuid}/ids?start=0&count=10`,
    { headers: { "X-Riot-Token": apiKey } }
  );
  if (!idsRes.ok) return Response.json({ error: "Failed to fetch match list" }, { status: 502 });

  const matchIds: string[] = await idsRes.json();

  // Fetch all match details in parallel
  const matchDetails = await Promise.all(
    matchIds.map((matchId) =>
      fetch(
        `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        { headers: { "X-Riot-Token": apiKey } }
      ).then((r) => r.json())
    )
  );

  const matches = matchDetails
    .filter((m) => m?.info?.participants)
    .map((m) => {
      const p = m.info.participants.find((p: { puuid: string }) => p.puuid === account.puuid);
      if (!p) return null;
      return {
        matchId: m.metadata.matchId,
        championName: p.championName as string,
        position: POSITION_DISPLAY[p.teamPosition as string] ?? p.teamPosition ?? "",
        win: p.win as boolean,
        kills: p.kills as number,
        deaths: p.deaths as number,
        assists: p.assists as number,
        cs: (p.totalMinionsKilled + p.neutralMinionsKilled) as number,
        items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter((i: number) => i > 0) as number[],
        spell1Id: p.summoner1Id as number,
        spell2Id: p.summoner2Id as number,
        queueName: QUEUE_NAMES[m.info.queueId as number] ?? "Game",
        gameDuration: m.info.gameDuration as number,
        gameCreation: m.info.gameCreation as number,
      };
    })
    .filter(Boolean);

  return Response.json(matches);
}
