"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCustomizer } from "@/context/CustomizerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPKR } from "@/lib/currency";
import { PriceBreakdownLines } from "./PriceBreakdownLines";

export function PriceDisplay() {
  const { price } = useCustomizer();

  return (
    <Card className="border-primary/30 bg-linear-to-br from-secondary/60 to-card">
      <CardContent className="space-y-2 py-5">
        <PriceBreakdownLines
          base={price.base}
          beads={price.beads}
          charm={price.charm}
          packaging={price.packaging}
        />
        <Separator className="my-2" />
        <div className="flex items-baseline justify-between">
          <span className="font-heading text-base">Total</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={price.total.toFixed(2)}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="font-heading text-2xl text-gradient-gold"
            >
              {formatPKR(price.total)}
            </motion.span>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
