import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { builds } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const [updated] = await db
    .update(builds)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(builds.id, Number(id)), eq(builds.userId, userId)))
    .returning();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(builds).where(and(eq(builds.id, Number(id)), eq(builds.userId, userId)));
  return NextResponse.json({ success: true });
}
