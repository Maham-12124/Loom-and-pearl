"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { ProductSummary } from "@/types/customizer";
import { formatPKR } from "@/lib/currency";

export function ProductListManager({ initialProducts }: { initialProducts: ProductSummary[] }) {
  const [products, setProducts] = useState(initialProducts);

  const handleDelete = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Ready-Made Products</h1>
        <Link href="/admin/products/new" className={buttonVariants({ className: "gap-2" })}>
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Wrist Size</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.heroImageUrl}
                  alt={product.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">{product.slug}</TableCell>
              <TableCell className="text-muted-foreground">{product.wristSize}</TableCell>
              <TableCell>{formatPKR(product.basePrice)}</TableCell>
              <TableCell>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Listed" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
