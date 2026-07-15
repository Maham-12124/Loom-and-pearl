import { prisma } from "@/lib/prisma";
import type { BeadOption, CharmOption, PackagingOptionData } from "@/types/customizer";

export async function getBeadOptions(): Promise<BeadOption[]> {
  const beads = await prisma.bead.findMany({ orderBy: { name: "asc" } });
  return beads.map((b) => ({
    id: b.id,
    name: b.name,
    hexCode: b.hexCode,
    textureUrl: b.textureUrl,
    finish: b.finish,
    size: b.size,
    price: b.price,
    stock: b.stock,
    isActive: b.isActive,
  }));
}

export async function getCharmOptions(): Promise<CharmOption[]> {
  const charms = await prisma.charm.findMany({ orderBy: { name: "asc" } });
  return charms.map((c) => ({
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl,
    price: c.price,
    stock: c.stock,
    isActive: c.isActive,
  }));
}

export async function getPackagingOptions(): Promise<PackagingOptionData[]> {
  const options = await prisma.packagingOption.findMany({ orderBy: { price: "asc" } });
  return options.map((p) => ({
    id: p.id,
    type: p.type,
    name: p.name,
    imageUrl: p.imageUrl,
    price: p.price,
    isActive: p.isActive,
  }));
}
