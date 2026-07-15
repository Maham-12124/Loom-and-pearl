import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const beadSlotSchema = z.object({
  beadId: z.string().nullable(),
  hexCode: z.string(),
  finish: z.string().min(1),
});

const productSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1).max(600),
  heroImageUrl: z.string().min(1),
  basePrice: z.number().min(0),
  wristSize: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  beadConfig: z.array(beadSlotSchema).min(1),
  charmId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}
