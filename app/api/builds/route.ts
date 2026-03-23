import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { builds, NewBuild } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const champion = searchParams.get("champion");
  const role = searchParams.get("role");

  const rows = await db.select().from(builds).where(eq(builds.userId, userId)).orderBy(desc(builds.createdAt));
  let result = rows;

  if (champion) {
    result = result.filter(b => b.champion.toLowerCase().includes(champion.toLowerCase()));
  }
  if (role && role !== "All") {
    result = result.filter(b => b.role === role);
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: NewBuild = await request.json();
  const [newBuild] = await db.insert(builds).values({ ...body, userId }).returning();
  return NextResponse.json(newBuild, { status: 201 });
}
