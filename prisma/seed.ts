import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---------- Admin + demo customer ----------
  const adminPasswordHash = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@loomandpearl.com" },
    update: {},
    create: {
      name: "Studio Admin",
      email: "admin@loomandpearl.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const mahamPasswordHash = await bcrypt.hash("Maham@123", 12);
  await prisma.user.upsert({
    where: { email: "mahamjahangir02@gmail.com" },
    update: { passwordHash: mahamPasswordHash, role: "ADMIN" },
    create: {
      name: "Maham Jahangir",
      email: "mahamjahangir02@gmail.com",
      passwordHash: mahamPasswordHash,
      role: "ADMIN",
    },
  });

  const customerPasswordHash = await bcrypt.hash("Customer123!", 12);
  await prisma.user.upsert({
    where: { email: "customer@loomandpearl.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@loomandpearl.com",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  // ---------- Finish & packaging types (admin-manageable) ----------
  const finishTypeNames = ["PEARLESCENT", "GLOSSY_CANDY", "MATTE", "METALLIC", "WOOD", "GEMSTONE"];
  await Promise.all(
    finishTypeNames.map((name) => prisma.finishType.upsert({ where: { name }, update: {}, create: { name } }))
  );

  const packagingTypeNames = ["VELVET_POUCH", "LUXURY_BOX", "GIFT_CARD_NOTE"];
  await Promise.all(
    packagingTypeNames.map((name) =>
      prisma.packagingType.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  // ---------- Bead inventory matrix (prices in PKR) ----------
  const beadSeeds = [
    { name: "Ivory Pearl", hexCode: "#f4ecd8", finish: "PEARLESCENT", size: "MM8", price: 250, stock: 200 },
    { name: "Champagne Pearl", hexCode: "#e8d9b5", finish: "PEARLESCENT", size: "MM8", price: 250, stock: 180 },
    { name: "Blush Pearl", hexCode: "#e7cfc9", finish: "PEARLESCENT", size: "MM6", price: 220, stock: 150 },
    { name: "Onyx Pearl", hexCode: "#2b2620", finish: "PEARLESCENT", size: "MM8", price: 280, stock: 140 },
    { name: "Ruby Candy", hexCode: "#c62b3a", finish: "GLOSSY_CANDY", size: "MM8", price: 200, stock: 160 },
    { name: "Tangerine Candy", hexCode: "#f2822a", finish: "GLOSSY_CANDY", size: "MM8", price: 200, stock: 160 },
    { name: "Lemon Candy", hexCode: "#f5d84c", finish: "GLOSSY_CANDY", size: "MM8", price: 200, stock: 160 },
    { name: "Mint Candy", hexCode: "#5fcf9e", finish: "GLOSSY_CANDY", size: "MM8", price: 200, stock: 160 },
    { name: "Sky Candy", hexCode: "#4fa3e3", finish: "GLOSSY_CANDY", size: "MM8", price: 200, stock: 160 },
    { name: "Grape Candy", hexCode: "#8a5fc7", finish: "GLOSSY_CANDY", size: "MM8", price: 200, stock: 160 },
    { name: "Cream Matte", hexCode: "#f1ead9", finish: "MATTE", size: "MM8", price: 170, stock: 220 },
    { name: "Sand Matte", hexCode: "#d8c39b", finish: "MATTE", size: "MM10", price: 190, stock: 200 },
    { name: "Charcoal Matte", hexCode: "#3a352f", finish: "MATTE", size: "MM8", price: 180, stock: 190 },
    { name: "Antique Gold", hexCode: "#b08d57", finish: "METALLIC", size: "MM6", price: 320, stock: 120 },
    { name: "Polished Silver", hexCode: "#c9cdd3", finish: "METALLIC", size: "MM6", price: 300, stock: 120 },
    { name: "Rose Gold", hexCode: "#caa08a", finish: "METALLIC", size: "MM6", price: 320, stock: 120 },
    { name: "Walnut Wood", hexCode: "#6b4a34", finish: "WOOD", size: "MM10", price: 150, stock: 180 },
    { name: "Oak Wood", hexCode: "#a98f5f", finish: "WOOD", size: "MM10", price: 150, stock: 0 },
    { name: "Emerald Gem", hexCode: "#2f6b4f", finish: "GEMSTONE", size: "MM8", price: 400, stock: 90 },
    { name: "Sapphire Gem", hexCode: "#2c4a8f", finish: "GEMSTONE", size: "MM8", price: 400, stock: 90 },
    { name: "Amethyst Gem", hexCode: "#6a3f8f", finish: "GEMSTONE", size: "MM8", price: 400, stock: 90 },
  ];

  const beads = await Promise.all(
    beadSeeds.map((b) =>
      prisma.bead.upsert({
        where: { id: `seed-${b.name.replace(/\s+/g, "-").toLowerCase()}` },
        update: { ...b, size: b.size as never },
        create: {
          id: `seed-${b.name.replace(/\s+/g, "-").toLowerCase()}`,
          ...b,
          size: b.size as never,
        },
      })
    )
  );

  // ---------- Charms (prices in PKR) ----------
  const TWEMOJI = (codepoint: string) =>
    `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codepoint}.png`;
  const charmSeeds = [
    { name: "Bow", imageUrl: TWEMOJI("1f380"), price: 750 },
    { name: "Pearl Shell", imageUrl: TWEMOJI("1f41a"), price: 850 },
    { name: "Daisy", imageUrl: TWEMOJI("1f33c"), price: 700 },
    { name: "Gold Heart", imageUrl: TWEMOJI("1f49b"), price: 800 },
    { name: "Evil Eye", imageUrl: TWEMOJI("1f9ff"), price: 900 },
    { name: "Star", imageUrl: TWEMOJI("2b50"), price: 700 },
    { name: "Moon", imageUrl: TWEMOJI("1f319"), price: 700 },
    { name: "Initial Charm", imageUrl: TWEMOJI("1f3f7"), price: 1000 },
    { name: "Clover", imageUrl: TWEMOJI("1f340"), price: 600 },
  ];
  const charms = await Promise.all(
    charmSeeds.map((c) =>
      prisma.charm.upsert({
        where: { id: `seed-${c.name.replace(/\s+/g, "-").toLowerCase()}` },
        update: { ...c, stock: 50 },
        create: { id: `seed-${c.name.replace(/\s+/g, "-").toLowerCase()}`, ...c, stock: 50 },
      })
    )
  );

  // ---------- Packaging (prices in PKR) ----------
  await Promise.all(
    [
      { id: "seed-velvet-pouch", type: "VELVET_POUCH", name: "Velvet Pouch", price: 400 },
      { id: "seed-luxury-box", type: "LUXURY_BOX", name: "Luxury Gift Box", price: 900 },
      { id: "seed-gift-card", type: "GIFT_CARD_NOTE", name: "Handwritten Card", price: 250 },
    ].map((p) =>
      prisma.packagingOption.upsert({
        where: { id: p.id },
        update: { name: p.name, price: p.price, type: p.type },
        create: p,
      })
    )
  );

  // ---------- Ready-made products ----------
  const ivory = beads.find((b) => b.name === "Ivory Pearl")!;
  const gold = beads.find((b) => b.name === "Antique Gold")!;
  const onyx = beads.find((b) => b.name === "Onyx Pearl")!;
  const ruby = beads.find((b) => b.name === "Ruby Candy")!;
  const lemon = beads.find((b) => b.name === "Lemon Candy")!;
  const mint = beads.find((b) => b.name === "Mint Candy")!;
  const heart = charms.find((c) => c.name === "Gold Heart")!;
  const clover = charms.find((c) => c.name === "Clover")!;

  const beadConfig = (pattern: (typeof beads)[number][], count: number) =>
    Array.from({ length: count }, (_, i) => {
      const b = pattern[i % pattern.length];
      return { beadId: b.id, hexCode: b.hexCode, finish: b.finish };
    });

  const ivoryGoldData = {
    name: "Ivory & Gold Classic",
    description:
      "A quietly luxurious staple: alternating ivory pearl and antique gold beads, finished with a gold heart charm.",
    heroImageUrl: "https://images.pexels.com/photos/36823003/pexels-photo-36823003.jpeg?auto=compress&cs=tinysrgb&w=800",
    basePrice: 320,
    wristSize: "MEDIUM",
    beadConfig: beadConfig([ivory, gold], 20),
    charmId: heart.id,
  };
  await prisma.product.upsert({
    where: { slug: "ivory-gold-classic" },
    update: ivoryGoldData,
    create: { slug: "ivory-gold-classic", ...ivoryGoldData },
  });

  const midnightOnyxData = {
    name: "Midnight Onyx",
    description: "Deep onyx pearls for evening wear, minimal and moody.",
    heroImageUrl: "https://images.pexels.com/photos/8408374/pexels-photo-8408374.jpeg?auto=compress&cs=tinysrgb&w=800",
    basePrice: 280,
    wristSize: "MEDIUM",
    beadConfig: beadConfig([onyx], 20),
    charmId: null,
  };
  await prisma.product.upsert({
    where: { slug: "midnight-onyx" },
    update: midnightOnyxData,
    create: { slug: "midnight-onyx", ...midnightOnyxData },
  });

  const candyPopData = {
    name: "Candy Pop",
    description: "A playful, vibrant trio of ruby, lemon, and mint glossy candy beads.",
    heroImageUrl: "https://images.pexels.com/photos/11260679/pexels-photo-11260679.jpeg?auto=compress&cs=tinysrgb&w=800",
    basePrice: 300,
    wristSize: "SMALL",
    beadConfig: beadConfig([ruby, lemon, mint], 16),
    charmId: clover.id,
  };
  await prisma.product.upsert({
    where: { slug: "candy-pop" },
    update: candyPopData,
    create: { slug: "candy-pop", ...candyPopData },
  });

  const champagne = beads.find((b) => b.name === "Champagne Pearl")!;
  const pearlShell = charms.find((c) => c.name === "Pearl Shell")!;

  const lemonPearlData = {
    name: "Lemon Pearl",
    description: "Freshwater-style pearls with a pop of sunny lemon seed beads.",
    heroImageUrl: "https://images.pexels.com/photos/36823004/pexels-photo-36823004.jpeg?auto=compress&cs=tinysrgb&w=800",
    basePrice: 250,
    wristSize: "MEDIUM",
    beadConfig: beadConfig([ivory, lemon], 20),
    charmId: null,
  };
  await prisma.product.upsert({
    where: { slug: "lemon-pearl" },
    update: lemonPearlData,
    create: { slug: "lemon-pearl", ...lemonPearlData },
  });

  const pearlTrioData = {
    name: "Pearl Trio",
    description: "A soft mix of ivory and champagne pearls, finished with a pearl shell charm.",
    heroImageUrl: "https://images.pexels.com/photos/36854165/pexels-photo-36854165.jpeg?auto=compress&cs=tinysrgb&w=800",
    basePrice: 350,
    wristSize: "MEDIUM",
    beadConfig: beadConfig([ivory, champagne], 20),
    charmId: pearlShell.id,
  };
  await prisma.product.upsert({
    where: { slug: "pearl-trio" },
    update: pearlTrioData,
    create: { slug: "pearl-trio", ...pearlTrioData },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
