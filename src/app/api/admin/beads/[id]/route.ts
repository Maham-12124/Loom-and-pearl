import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const beadUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  hexCode: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  textureUrl: z.string().min(1).nullable().optional(),
  finish: z.string().min(1).optional(),
  size: z.enum(["MM6", "MM8", "MM10"]).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = beadUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const bead = await prisma.bead.update({ where: { id }, data: parsed.data });
  return NextResponse.json(bead);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.bead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
