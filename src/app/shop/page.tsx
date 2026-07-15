import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatPKR } from "@/lib/currency";

export const metadata = { title: "Shop — Loom & Pearl" };
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="pattern-bloom relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-linear-to-b from-background/40 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            The Collection
          </p>
          <h1 className="font-heading text-5xl text-gradient-gold">Ready-Made Designs</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Start with a curated design, then make it entirely yours.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.heroImageUrl}
                  alt={product.name}
                  className="aspect-square w-full bg-secondary/40 object-cover"
                />
                <CardContent className="space-y-1 py-4">
                  <p className="font-heading text-lg">{product.name}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                  <p className="pt-1 font-heading text-gradient-gold">
                    From {formatPKR(product.basePrice)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground">No products published yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
