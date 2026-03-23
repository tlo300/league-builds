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
  420: "Ranked Solo/Duo", 440: "Ranked Flex", 430: "Normal Blind",
  400: "Normal Draft", 450: "ARAM", 900: "URF", 1020: "One for All",
  1400: "Spellbook", 0: "Custom",
};

const POSITION_DISPLAY: Record<string, string> = {
  TOP: "Top", JUNGLE: "Jungle", MIDDLE: "Mid", BOTTOM: "Bot", UTILITY: "Support",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, matchId } = await params;

  const [account] = await db
    .select()
    .from(linkedAccounts)
    .where(and(eq(linkedAccounts.id, Number(id)), eq(linkedAccounts.userId, userId)));

  if (!account) return Response.json({ error: "Account not found" }, { status: 404 });

  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) return Response.json({ error: "Riot API key not configured" }, { status: 500 });

  const routing = ROUTING[account.region];
  const matchRes = await fetch(
    `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    { headers: { "X-Riot-Token": apiKey } }
  );
  if (!matchRes.ok) return Response.json({ error: "Match not found" }, { status: 404 });

  const { info, metadata } = await matchRes.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const participants = info.participants.map((p: any) => ({
    puuid: p.puuid,
    isCurrentUser: p.puuid === account.puuid,
    riotIdGameName: p.riotIdGameName ?? p.summonerName ?? "Unknown",
    riotIdTagline: p.riotIdTagline ?? "",
    championName: p.championName as string,
    position: POSITION_DISPLAY[p.teamPosition as string] ?? "",
    level: p.champLevel as number,
    kills: p.kills as number,
    deaths: p.deaths as number,
    assists: p.assists as number,
    cs: (p.totalMinionsKilled + p.neutralMinionsKilled) as number,
    goldEarned: p.goldEarned as number,
    totalDamageDealt: p.totalDamageDealtToChampions as number,
    visionScore: p.visionScore as number,
    items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6] as number[],
    spell1Id: p.summoner1Id as number,
    spell2Id: p.summoner2Id as number,
    keystoneId: (p.perks?.styles?.[0]?.selections?.[0]?.perk ?? 0) as number,
    primaryPathId: (p.perks?.styles?.[0]?.style ?? 0) as number,
    secondaryPathId: (p.perks?.styles?.[1]?.style ?? 0) as number,
    teamId: p.teamId as number,
    win: p.win as boolean,
    doubleKills: p.doubleKills as number,
    tripleKills: p.tripleKills as number,
    quadraKills: p.quadraKills as number,
    pentaKills: p.pentaKills as number,
    largestKillingSpree: p.largestKillingSpree as number,
    firstBloodKill: p.firstBloodKill as boolean,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teams = (info.teams as any[]).map((team) => ({
    teamId: team.teamId as number,
    win: team.win as boolean,
    objectives: {
      baron: (team.objectives?.baron?.kills ?? 0) as number,
      dragon: (team.objectives?.dragon?.kills ?? 0) as number,
      tower: (team.objectives?.tower?.kills ?? 0) as number,
      riftHerald: (team.objectives?.riftHerald?.kills ?? 0) as number,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participants: participants.filter((p: any) => p.teamId === team.teamId),
  }));

  return Response.json({
    matchId: metadata.matchId as string,
    queueName: QUEUE_NAMES[info.queueId as number] ?? "Game",
    gameDuration: info.gameDuration as number,
    gameCreation: info.gameCreation as number,
    teams,
  });
}
