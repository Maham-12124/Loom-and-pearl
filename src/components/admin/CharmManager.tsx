"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CharmOption } from "@/types/customizer";
import { formatPKR } from "@/lib/currency";
import { ImageUrlField } from "./ImageUrlField";

type CharmFormState = {
  id?: string;
  name: string;
  imageUrl: string;
  price: string;
  stock: string;
  isActive: boolean;
};

const emptyForm: CharmFormState = { name: "", imageUrl: "", price: "800", stock: "0", isActive: true };

export function CharmManager({ initialCharms }: { initialCharms: CharmOption[] }) {
  const [charms, setCharms] = useState(initialCharms);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CharmFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openEdit = (charm: CharmOption) => {
    setForm({
      id: charm.id,
      name: charm.name,
      imageUrl: charm.imageUrl,
      price: String(charm.price),
      stock: String(charm.stock),
      isActive: charm.isActive,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      imageUrl: form.imageUrl,
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: form.isActive,
    };
    try {
      const res = await fetch(form.id ? `/api/admin/charms/${form.id}` : "/api/admin/charms", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setCharms((prev) => (form.id ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev]));
      toast.success(form.id ? "Charm updated" : "Charm added");
      setOpen(false);
    } catch {
      toast.error("Could not save this charm.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setCharms((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/admin/charms/${id}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl">Charms</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button className="gap-2" onClick={() => setForm(emptyForm)} />}
          >
            <Plus className="h-4 w-4" /> Add Charm
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">{form.id ? "Edit Charm" : "New Charm"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <ImageUrlField
                label="Image"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                trimBackground
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Price (Rs.)</Label>
                  <Input
                    type="number"
                    step="10"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving || !form.name || !form.imageUrl}>
                {saving ? "Saving…" : "Save Charm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {charms.map((charm) => (
            <TableRow key={charm.id}>
              <TableCell>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={charm.imageUrl} alt={charm.name} className="h-8 w-8 rounded-full object-cover" />
              </TableCell>
              <TableCell className="font-medium">{charm.name}</TableCell>
              <TableCell>{formatPKR(charm.price)}</TableCell>
              <TableCell className={charm.stock === 0 ? "text-destructive" : undefined}>
                {charm.stock}
              </TableCell>
              <TableCell>
                <Badge variant={charm.isActive && charm.stock > 0 ? "default" : "secondary"}>
                  {charm.isActive && charm.stock > 0 ? "Visible" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEdit(charm)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(charm.id)}>
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
