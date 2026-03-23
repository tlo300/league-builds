import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { linkedAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

const ROUTING: Record<string, string> = {
  NA1: "americas", BR1: "americas", LA1: "americas", LA2: "americas",
  EUW1: "europe", EUN1: "europe", TR1: "europe", RU: "europe",
  KR: "asia", JP1: "asia",
  OC1: "sea", PH2: "sea", SG2: "sea", TH2: "sea", VN2: "sea", TW2: "sea",
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await db
    .select()
    .from(linkedAccounts)
    .where(eq(linkedAccounts.userId, userId))
    .orderBy(linkedAccounts.createdAt);

  return Response.json(accounts);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { gameName, tagLine, region } = await req.json();
  if (!gameName || !tagLine || !region) {
    return Response.json({ error: "gameName, tagLine, and region are required" }, { status: 400 });
  }

  const routing = ROUTING[region];
  if (!routing) return Response.json({ error: "Unknown region" }, { status: 400 });

  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) return Response.json({ error: "Riot API key not configured" }, { status: 500 });

  // Look up puuid via Riot Account API
  const riotRes = await fetch(
    `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { headers: { "X-Riot-Token": apiKey } }
  );

  if (riotRes.status === 404) {
    return Response.json({ error: `Account "${gameName}#${tagLine}" not found` }, { status: 404 });
  }
  if (!riotRes.ok) {
    return Response.json({ error: "Riot API error — check your API key" }, { status: 502 });
  }

  const { puuid } = await riotRes.json();

  const [account] = await db
    .insert(linkedAccounts)
    .values({ userId, gameName, tagLine, region, puuid })
    .returning();

  return Response.json(account);
}
