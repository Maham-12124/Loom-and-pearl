import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const packagingSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.string().min(1),
  imageUrl: z.string().min(1).nullable().optional(),
  price: z.number().min(0),
  isActive: z.boolean().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const options = await prisma.packagingOption.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(options);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = packagingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const option = await prisma.packagingOption.create({ data: parsed.data });
  return NextResponse.json(option, { status: 201 });
}
