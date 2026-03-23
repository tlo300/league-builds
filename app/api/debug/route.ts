import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { builds } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  let userId: string | null = null;
  let authError: string | null = null;
  let dbError: string | null = null;
  let buildCount: number | null = null;
  const dbHost = process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] ?? "unknown";

  try {
    const result = await auth();
    userId = result.userId;
  } catch (e) {
    authError = String(e);
  }

  if (userId) {
    try {
      const rows = await db.select().from(builds).where(eq(builds.userId, userId));
      buildCount = rows.length;
    } catch (e: unknown) {
      const err = e as Error & { cause?: unknown };
      dbError = JSON.stringify({
        message: err?.message,
        cause: String(err?.cause),
      });
    }
  }

  return NextResponse.json({ userId, buildCount, authError, dbError, dbHost });
}
