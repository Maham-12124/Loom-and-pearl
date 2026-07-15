import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const packagingUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  type: z.string().min(1).optional(),
  imageUrl: z.string().min(1).nullable().optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = packagingUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const option = await prisma.packagingOption.update({ where: { id }, data: parsed.data });
  return NextResponse.json(option);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.packagingOption.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
