import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const beadSchema = z.object({
  name: z.string().min(1).max(80),
  hexCode: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  textureUrl: z.string().min(1).nullable().optional(),
  finish: z.string().min(1),
  size: z.enum(["MM6", "MM8", "MM10"]),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  isActive: z.boolean().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const beads = await prisma.bead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(beads);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = beadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const bead = await prisma.bead.create({ data: parsed.data });
  return NextResponse.json(bead, { status: 201 });
}
