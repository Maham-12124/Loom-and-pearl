import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
        <p className="font-heading text-base text-foreground">Loom &amp; Pearl</p>
        <p>Quietly made. Individually yours.</p>
        <nav className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <Link href="/customize" className="hover:text-foreground">
            Customize
          </Link>
          <Link href="/account" className="hover:text-foreground">
            Track Order
          </Link>
          <a
            href="https://wa.me/923097329778"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Us
          </a>
        </nav>
      </div>
    </footer>
  );
}
