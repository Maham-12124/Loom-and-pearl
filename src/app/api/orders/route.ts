import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { designSnapshotSchema } from "@/lib/design-snapshot";
import { DELIVERY_CHARGE } from "@/types/customizer";

const orderSchema = z
  .object({
    shippingName: z.string().min(1).max(120),
    shippingAddress: z.string().min(1).max(200),
    shippingCity: z.string().min(1).max(100),
    shippingPostal: z.string().min(1).max(20),
    shippingCountry: z.string().min(1).max(100),
    paymentMethod: z.enum(["COD", "JAZZCASH_EASYPAISA"]),
    paymentReference: z.string().max(120).optional().nullable(),
    paymentScreenshotUrl: z.string().min(1).optional().nullable(),
    items: z
      .array(
        z.object({
          productId: z.string().nullable(),
          productName: z.string(),
          design: designSnapshotSchema,
          unitPrice: z.number().min(0),
          quantity: z.number().int().min(1),
        })
      )
      .min(1),
  })
  .refine((data) => data.paymentMethod !== "JAZZCASH_EASYPAISA" || !!data.paymentScreenshotUrl, {
    message: "A transaction screenshot is required for JazzCash / EasyPaisa orders.",
    path: ["paymentScreenshotUrl"],
  });

export async function POST(req: NextRequest) {
  const session = await auth();
  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { items, ...shipping } = parsed.data;

  const packagingIds = [...new Set(items.map((i) => i.design.packaging.packagingId).filter(Boolean))] as string[];
  const packagingOptions = packagingIds.length
    ? await prisma.packagingOption.findMany({ where: { id: { in: packagingIds } } })
    : [];
  const packagingPriceById = new Map(packagingOptions.map((p) => [p.id, p.price]));

  const itemsTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const packagingTotal = items.reduce((sum, i) => {
    const price = i.design.packaging.packagingId
      ? packagingPriceById.get(i.design.packaging.packagingId) ?? 0
      : 0;
    return sum + price * i.quantity;
  }, 0);
  const subtotal = itemsTotal - packagingTotal;
  const total = itemsTotal + DELIVERY_CHARGE;
  const giftNote = items.map((i) => i.design.packaging.note).find((n) => n.trim().length > 0) ?? null;

  const order = await prisma.$transaction(
    async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: session?.user?.id,
          status: "PENDING",
          subtotal,
          packagingTotal,
          deliveryCharge: DELIVERY_CHARGE,
          total,
          giftNote,
          ...shipping,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              designSnapshot: i.design,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              lineTotal: i.unitPrice * i.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Best-effort stock decrement for every bead/charm used in the order.
      for (const item of items) {
        const beadCounts = new Map<string, number>();
        for (const slot of item.design.beads) {
          if (!slot.beadId) continue;
          beadCounts.set(slot.beadId, (beadCounts.get(slot.beadId) ?? 0) + item.quantity);
        }
        for (const [beadId, count] of beadCounts) {
          await tx.bead.updateMany({
            where: { id: beadId, stock: { gte: count } },
            data: { stock: { decrement: count } },
          });
        }
        if (item.design.charmId) {
          await tx.charm.updateMany({
            where: { id: item.design.charmId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return created;
    },
    // Neon's connection latency from this app's region can exceed Prisma's
    // 2s/5s defaults for acquiring/running a transaction — widen both.
    { maxWait: 10000, timeout: 20000 }
  );

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
