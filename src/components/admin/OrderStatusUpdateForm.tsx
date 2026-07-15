"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUS_OPTIONS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type OrderStatus = (typeof STATUS_OPTIONS)[number];

export interface OrderStatusUpdateFormProps {
  orderId: string;
  initialStatus: OrderStatus;
  initialTrackingNumber: string | null;
  initialCarrier: string | null;
}

export function OrderStatusUpdateForm({
  orderId,
  initialStatus,
  initialTrackingNumber,
  initialCarrier,
}: OrderStatusUpdateFormProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber ?? "");
  const [carrier, setCarrier] = useState(initialCarrier ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber.trim() || null,
          carrier: carrier.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Order updated");
    } catch {
      toast.error("Could not update this order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Carrier</Label>
          <Input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="e.g. TCS, Leopards"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tracking Number</Label>
          <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
        </div>
      </div>
      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Update Order"}
      </Button>
    </div>
  );
}
