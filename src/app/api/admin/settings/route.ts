import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const settingsSchema = z.object({
  jazzcashAccountNumber: z.string().max(40).nullable().optional(),
  jazzcashAccountName: z.string().max(80).nullable().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });
  return NextResponse.json(settings);
}
