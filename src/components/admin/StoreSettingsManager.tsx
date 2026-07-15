"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export interface StoreSettingsData {
  jazzcashAccountNumber: string | null;
  jazzcashAccountName: string | null;
}

export function StoreSettingsManager({ initialSettings }: { initialSettings: StoreSettingsData }) {
  const [form, setForm] = useState({
    jazzcashAccountNumber: initialSettings.jazzcashAccountNumber ?? "",
    jazzcashAccountName: initialSettings.jazzcashAccountName ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jazzcashAccountNumber: form.jazzcashAccountNumber || null,
          jazzcashAccountName: form.jazzcashAccountName || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
    } catch {
      toast.error("Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">JazzCash / EasyPaisa</CardTitle>
          <p className="text-sm text-muted-foreground">
            Shown to customers at checkout when they choose JazzCash / EasyPaisa, so they know
            where to send payment.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Account Number</Label>
            <Input
              value={form.jazzcashAccountNumber}
              onChange={(e) => setForm({ ...form, jazzcashAccountNumber: e.target.value })}
              placeholder="0300-1234567"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Account Name</Label>
            <Input
              value={form.jazzcashAccountName}
              onChange={(e) => setForm({ ...form, jazzcashAccountName: e.target.value })}
              placeholder="Loom & Pearl"
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
