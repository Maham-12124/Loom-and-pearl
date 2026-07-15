import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  wristInches: z.number().positive().max(12).nullable().optional(),
  wristSize: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
  preferences: z.string().max(500).nullable().optional(),
  savedDesign: z.any().optional(),
});

async function assertOwnership(id: string, userId: string) {
  const profile = await prisma.friendProfile.findUnique({ where: { id } });
  if (!profile || profile.ownerId !== userId) return null;
  return profile;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await assertOwnership(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.friendProfile.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await assertOwnership(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.friendProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
