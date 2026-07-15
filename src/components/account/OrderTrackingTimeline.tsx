import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

const STAGE_LABEL: Record<(typeof STAGES)[number], string> = {
  PENDING: "Order Placed",
  PAID: "Payment Confirmed",
  PROCESSING: "Crafting Your Piece",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

export interface OrderTrackingTimelineProps {
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

export function OrderTrackingTimeline({
  status,
  trackingNumber,
  carrier,
  shippedAt,
  deliveredAt,
}: OrderTrackingTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
        <XCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">This order was cancelled.</p>
      </div>
    );
  }

  const currentIndex = STAGES.indexOf(status as (typeof STAGES)[number]);

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        {STAGES.map((stage, i) => {
          const done = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <li key={stage} className="flex items-start gap-3">
              {done ? (
                <CheckCircle2
                  className={cn("h-5 w-5 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")}
                />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
              )}
              <div>
                <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>
                  {STAGE_LABEL[stage]}
                </p>
                {stage === "SHIPPED" && shippedAt && (
                  <p className="text-xs text-muted-foreground">{shippedAt.toLocaleDateString()}</p>
                )}
                {stage === "DELIVERED" && deliveredAt && (
                  <p className="text-xs text-muted-foreground">{deliveredAt.toLocaleDateString()}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {(trackingNumber || carrier) && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          {carrier && <p><span className="text-muted-foreground">Carrier:</span> {carrier}</p>}
          {trackingNumber && (
            <p><span className="text-muted-foreground">Tracking #:</span> {trackingNumber}</p>
          )}
        </div>
      )}
    </div>
  );
}
