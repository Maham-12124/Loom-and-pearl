"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BEAD_FINISH_LABEL, BeadFinish, BeadMM, BeadOption } from "@/types/customizer";
import { formatPKR } from "@/lib/currency";
import { beadSwatchBackground } from "@/lib/color-utils";
import { TypeSelectWithAdd, TypeOption } from "./TypeSelectWithAdd";
import { ImageUrlField } from "./ImageUrlField";

type BeadFormState = {
  id?: string;
  name: string;
  hexCode: string;
  textureUrl: string;
  finish: BeadFinish;
  size: BeadMM;
  price: string;
  stock: string;
  isActive: boolean;
};

const emptyForm: BeadFormState = {
  name: "",
  hexCode: "#c6a664",
  textureUrl: "",
  finish: "MATTE",
  size: "MM8",
  price: "200",
  stock: "0",
  isActive: true,
};

export function BeadInventoryManager({
  initialBeads,
  initialFinishTypes,
}: {
  initialBeads: BeadOption[];
  initialFinishTypes: TypeOption[];
}) {
  const [beads, setBeads] = useState(initialBeads);
  const [finishTypes, setFinishTypes] = useState(initialFinishTypes);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BeadFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (bead: BeadOption) => {
    setForm({
      id: bead.id,
      name: bead.name,
      hexCode: bead.hexCode ?? "#c6a664",
      textureUrl: bead.textureUrl ?? "",
      finish: bead.finish,
      size: bead.size,
      price: String(bead.price),
      stock: String(bead.stock),
      isActive: bead.isActive,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      hexCode: form.hexCode,
      textureUrl: form.textureUrl || null,
      finish: form.finish,
      size: form.size,
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: form.isActive,
    };
    try {
      const res = await fetch(form.id ? `/api/admin/beads/${form.id}` : "/api/admin/beads", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setBeads((prev) =>
        form.id ? prev.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...prev]
      );
      toast.success(form.id ? "Bead updated" : "Bead added");
      setOpen(false);
    } catch {
      toast.error("Could not save this bead.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBeads((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/admin/beads/${id}`, { method: "DELETE" });
  };

  const toggleActive = async (bead: BeadOption) => {
    const res = await fetch(`/api/admin/beads/${bead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !bead.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBeads((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Bead Inventory</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2" onClick={openCreate} />}>
            <Plus className="h-4 w-4" /> Add Bead
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">{form.id ? "Edit Bead" : "New Bead"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Hex Code</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.hexCode}
                      onChange={(e) => setForm({ ...form, hexCode: e.target.value })}
                      className="h-9 w-10 cursor-pointer rounded border border-border bg-transparent"
                    />
                    <Input
                      value={form.hexCode}
                      onChange={(e) => setForm({ ...form, hexCode: e.target.value })}
                    />
                  </div>
                </div>
                <TypeSelectWithAdd
                  label="Finish"
                  value={form.finish}
                  onChange={(v) => setForm({ ...form, finish: v })}
                  options={finishTypes}
                  onOptionsChange={setFinishTypes}
                  createEndpoint="/api/admin/finish-types"
                />
              </div>
              <ImageUrlField
                label="Texture Image (optional)"
                value={form.textureUrl}
                onChange={(url) => setForm({ ...form, textureUrl: url })}
              />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Size</Label>
                  <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v as BeadMM })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM6">6mm</SelectItem>
                      <SelectItem value="MM8">8mm</SelectItem>
                      <SelectItem value="MM10">10mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Price (Rs.)</Label>
                  <Input
                    type="number"
                    step="10"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label>Active</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving || !form.name}>
                {saving ? "Saving…" : "Save Bead"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Swatch</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Finish</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beads.map((bead) => (
            <TableRow key={bead.id}>
              <TableCell>
                <span
                  className="inline-block h-6 w-6 rounded-full border border-border"
                  style={{ background: beadSwatchBackground(bead.hexCode ?? "#ccc", bead.textureUrl) }}
                />
              </TableCell>
              <TableCell className="font-medium">{bead.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {BEAD_FINISH_LABEL[bead.finish] ?? bead.finish}
              </TableCell>
              <TableCell className="text-muted-foreground">{bead.size.replace("MM", "")}mm</TableCell>
              <TableCell>{formatPKR(bead.price)}</TableCell>
              <TableCell className={bead.stock === 0 ? "text-destructive" : undefined}>
                {bead.stock}
              </TableCell>
              <TableCell>
                <Badge
                  variant={bead.isActive && bead.stock > 0 ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => toggleActive(bead)}
                >
                  {bead.isActive && bead.stock > 0 ? "Visible" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEdit(bead)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(bead.id)}>
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
