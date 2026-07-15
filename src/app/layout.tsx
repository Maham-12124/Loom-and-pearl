import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/providers/Providers";
import { NavBar } from "@/components/layout/NavBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Loom & Pearl — Custom Fine Jewelry",
  description:
    "Design your own bracelet, bead by bead. Quiet luxury, made for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <TooltipProvider delay={150}>
            <NavBar />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
            <Toaster position="bottom-center" richColors />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
