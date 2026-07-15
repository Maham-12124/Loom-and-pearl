"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { DesignState, PackagingOptionData } from "@/types/customizer";

export interface CartLineItem {
  id: string;
  productId: string | null;
  productName: string;
  productImageUrl: string | null;
  design: DesignState;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  items: CartLineItem[];
  addItem: (item: Omit<CartLineItem, "id" | "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  updatePackaging: (
    id: string,
    packagingId: string | null,
    note: string,
    packagingOptions: PackagingOptionData[]
  ) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => ({
          items: [...state.items, { ...item, id: nanoid(), quantity }],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),
      updatePackaging: (id, packagingId, note, packagingOptions) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const oldPrice = item.design.packaging.packagingId
              ? packagingOptions.find((p) => p.id === item.design.packaging.packagingId)?.price ?? 0
              : 0;
            const newPrice = packagingId
              ? packagingOptions.find((p) => p.id === packagingId)?.price ?? 0
              : 0;
            return {
              ...item,
              unitPrice: item.unitPrice - oldPrice + newPrice,
              design: { ...item.design, packaging: { packagingId, note } },
            };
          }),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "loom-and-pearl-cart" }
  )
);

export function cartTotal(items: CartLineItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}
