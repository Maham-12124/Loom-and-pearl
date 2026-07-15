import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const charmSchema = z.object({
  name: z.string().min(1).max(80),
  imageUrl: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  isActive: z.boolean().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const charms = await prisma.charm.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(charms);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = charmSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const charm = await prisma.charm.create({ data: parsed.data });
  return NextResponse.json(charm, { status: 201 });
}
