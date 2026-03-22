import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { builds, NewBuild } from "@/db/schema";
import { eq, desc, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const champion = searchParams.get("champion");
  const role = searchParams.get("role");

  let query = db.select().from(builds).orderBy(desc(builds.createdAt));

  const rows = await query;
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
  const body: NewBuild = await request.json();
  const [newBuild] = await db.insert(builds).values(body).returning();
  return NextResponse.json(newBuild, { status: 201 });
}
