import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const beadSlotSchema = z.object({
  beadId: z.string().nullable(),
  hexCode: z.string(),
  finish: z.string().min(1),
});

const productUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().min(1).max(600).optional(),
  heroImageUrl: z.string().min(1).optional(),
  basePrice: z.number().min(0).optional(),
  wristSize: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
  beadConfig: z.array(beadSlotSchema).min(1).optional(),
  charmId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = productUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
