"use client";

import { useCustomizer } from "@/context/CustomizerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/currency";

export function CharmSelector() {
  const { charmOptions, design, setCharm } = useCustomizer();
  const available = charmOptions.filter((c) => c.isActive && c.stock > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Charm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCharm(null)}
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full border-2 text-xs text-muted-foreground",
              design.charmId === null ? "border-primary ring-2 ring-primary/40" : "border-border"
            )}
          >
            None
          </button>
          {available.map((charm) => (
            <button
              key={charm.id}
              type="button"
              title={`${charm.name} — ${formatPKR(charm.price)}`}
              onClick={() => setCharm(charm.id)}
              className={cn(
                "h-16 w-16 overflow-hidden rounded-full border-2 shadow-sm transition-transform hover:scale-105",
                design.charmId === charm.id
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={charm.imageUrl} alt={charm.name} className="h-full w-full object-cover" />
            </button>
          ))}
          {available.length === 0 && (
            <p className="text-sm text-muted-foreground">No charms currently in stock.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
