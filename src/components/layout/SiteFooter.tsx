import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
        <p className="font-heading text-base text-foreground">Loom &amp; Pearl</p>
        <p>Quietly made. Individually yours.</p>
        <nav className="flex gap-4">
          <Link href="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <Link href="/customize" className="hover:text-foreground">
            Customize
          </Link>
          <Link href="/account" className="hover:text-foreground">
            Track Order
          </Link>
        </nav>
      </div>
    </footer>
  );
}
