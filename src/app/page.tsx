import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Wand2, Gem } from "lucide-react";
import { formatPKR } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <section className="pattern-bloom relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-background/30 to-background" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-20 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Custom Fine Jewelry
          </p>
          <h1 className="font-heading text-5xl leading-tight md:text-6xl">
            Quietly made.
            <br />
            <span className="text-gradient-gold">Individually yours.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Design a bracelet bead by bead — choose every finish, every charm, every detail — or
            start from a piece we&apos;ve already imagined.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/customize" className={buttonVariants({ size: "lg", className: "gap-2" })}>
              <Wand2 className="h-4 w-4" />
              Start Designing
            </Link>
            <Link href="/shop" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Browse Ready-Made
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-3">
          <div className="text-center">
            <Gem className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 font-heading text-lg">Bead by Bead</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every bead is yours to choose — pearlescent, glossy, matte, or gemstone.
            </p>
          </div>
          <div className="text-center">
            <Sparkles className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 font-heading text-lg">AI Design Assistant</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe a mood, and let our assistant sketch the palette for you.
            </p>
          </div>
          <div className="text-center">
            <Wand2 className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 font-heading text-lg">Made to Gift</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Save sizing profiles for friends, wrap it beautifully, add a note.
            </p>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-3xl">Featured Designs</h2>
            <Link href="/shop" className="text-sm text-primary underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featured.map((product) => (
              <Link key={product.id} href={`/shop/${product.slug}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.heroImageUrl}
                    alt={product.name}
                    className="aspect-square w-full bg-secondary/40 object-cover"
                  />
                  <CardContent className="py-4">
                    <p className="font-heading text-lg">{product.name}</p>
                    <p className="text-sm text-muted-foreground">From {formatPKR(product.basePrice)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
