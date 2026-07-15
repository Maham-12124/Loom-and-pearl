import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  wristInches: z.number().positive().max(12).optional(),
  wristSize: z.enum(["SMALL", "MEDIUM", "LARGE"]).default("MEDIUM"),
  preferences: z.string().max(500).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await prisma.friendProfile.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = await prisma.friendProfile.create({
    data: { ownerId: session.user.id, ...parsed.data },
  });
  return NextResponse.json(profile, { status: 201 });
}
