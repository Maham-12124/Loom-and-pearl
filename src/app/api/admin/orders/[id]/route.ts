import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().max(120).nullable().optional(),
  carrier: z.string().max(80).nullable().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, user: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = orderUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { status, trackingNumber, carrier } = parsed.data;
  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(carrier !== undefined && { carrier }),
      ...(status === "SHIPPED" && !existing.shippedAt && { shippedAt: new Date() }),
      ...(status === "DELIVERED" && !existing.deliveredAt && { deliveredAt: new Date() }),
    },
  });
  return NextResponse.json(order);
}
