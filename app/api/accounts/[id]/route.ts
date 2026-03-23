import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { linkedAccounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db
    .delete(linkedAccounts)
    .where(and(eq(linkedAccounts.id, Number(id)), eq(linkedAccounts.userId, userId)));

  return Response.json({ ok: true });
}
