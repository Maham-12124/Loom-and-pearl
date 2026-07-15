import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const packagingTypeSchema = z.object({
  name: z.string().min(1).max(40),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const types = await prisma.packagingType.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = packagingTypeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.packagingType.findUnique({ where: { name: parsed.data.name } });
  if (existing) return NextResponse.json({ error: "That packaging type already exists." }, { status: 409 });

  const type = await prisma.packagingType.create({ data: parsed.data });
  return NextResponse.json(type, { status: 201 });
}
