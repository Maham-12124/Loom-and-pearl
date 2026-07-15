import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const packagingTypeUpdateSchema = z.object({
  name: z.string().min(1).max(40),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = packagingTypeUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.packagingType.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Keep packaging options referencing this type in sync when it's renamed.
  const [type] = await prisma.$transaction([
    prisma.packagingType.update({ where: { id }, data: parsed.data }),
    prisma.packagingOption.updateMany({
      where: { type: existing.name },
      data: { type: parsed.data.name },
    }),
  ]);
  return NextResponse.json(type);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const type = await prisma.packagingType.findUnique({ where: { id } });
  if (!type) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const inUse = await prisma.packagingOption.count({ where: { type: type.name } });
  if (inUse > 0) {
    return NextResponse.json(
      { error: `${inUse} packaging option(s) still use this type. Reassign or delete them first.` },
      { status: 409 }
    );
  }

  await prisma.packagingType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
